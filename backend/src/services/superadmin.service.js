/**
 * SUPER ADMIN SERVICE
 * -------------------
 * Platform-level operations: create restaurants + owners,
 * delete restaurants, platform-wide stats with 20% commission.
 */

const bcrypt = require("bcryptjs");
const Restaurant = require("../models/restaurant.model");
const Menu = require("../models/menu.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const PLATFORM_COMMISSION_RATE = 0.20; // 20%

// ──────────────────────────────────────
//  HELPER — generate random password
// ──────────────────────────────────────
const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  pw += special[Math.floor(Math.random() * special.length)];
  pw += Math.floor(Math.random() * 10);
  return pw;
};

// ──────────────────────────────────────
//  CREATE RESTAURANT + OWNER ACCOUNT
// ──────────────────────────────────────
const createRestaurantWithOwner = async (restaurantData, ownerName, ownerEmail) => {
  if (!restaurantData.name || !restaurantData.address) {
    throw new ApiError(400, "Restaurant name and address are required");
  }
  if (!ownerEmail || !ownerName) {
    throw new ApiError(400, "Owner name and email are required");
  }

  // Check if owner email already exists
  let ownerUser = await User.findOne({ email: ownerEmail });
  let generatedPassword = null;

  if (ownerUser) {
    // If user exists but is not a restaurant_owner, upgrade role
    if (ownerUser.role !== "restaurant_owner" && ownerUser.role !== "admin") {
      ownerUser.role = "restaurant_owner";
      await ownerUser.save();
    }
  } else {
    // Create new owner account with auto-generated password
    generatedPassword = generatePassword();
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);
    ownerUser = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: hashedPassword,
      role: "restaurant_owner",
    });
  }

  // Create the restaurant linked to owner
  const restaurant = await Restaurant.create({
    name: restaurantData.name,
    address: restaurantData.address,
    description: restaurantData.description || null,
    imageUrl: restaurantData.imageUrl || null,
    cuisine: restaurantData.cuisine || null,
    ownerId: ownerUser._id.toString(),
  });

  return {
    restaurant,
    owner: {
      id: ownerUser._id,
      name: ownerUser.name,
      email: ownerUser.email,
      isNewAccount: !!generatedPassword,
      generatedPassword, // null if account already existed
    },
  };
};

// ──────────────────────────────────────
//  DELETE RESTAURANT
// ──────────────────────────────────────
const deleteRestaurant = async (id) => {
  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  // Delete associated menu items, then restaurant
  await Menu.destroy({ where: { restaurantId: id } });
  await restaurant.destroy();

  return { deletedId: id, name: restaurant.name };
};

// ──────────────────────────────────────
//  GET ALL RESTAURANTS (with owner info)
// ──────────────────────────────────────
const getAllRestaurants = async () => {
  const restaurants = await Restaurant.findAll({
    order: [["createdAt", "DESC"]],
  });

  // Enrich with owner info from MongoDB
  const ownerIds = [...new Set(restaurants.map((r) => r.ownerId).filter(Boolean))];
  const owners = await User.find(
    { _id: { $in: ownerIds } },
    "name email"
  );
  const ownerMap = {};
  owners.forEach((o) => {
    ownerMap[o._id.toString()] = { name: o.name, email: o.email };
  });

  // Get per-restaurant order count & revenue (delivered orders)
  const restaurantIds = restaurants.map((r) => r.id);
  const revenueStats = await Order.aggregate([
    { $match: { restaurantId: { $in: restaurantIds }, status: "delivered" } },
    {
      $group: {
        _id: "$restaurantId",
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);
  const allOrderCounts = await Order.aggregate([
    { $match: { restaurantId: { $in: restaurantIds } } },
    {
      $group: {
        _id: "$restaurantId",
        totalOrders: { $sum: 1 },
      },
    },
  ]);
  const revenueMap = {};
  revenueStats.forEach((r) => {
    revenueMap[r._id] = { revenue: r.totalRevenue };
  });
  const orderMap = {};
  allOrderCounts.forEach((r) => {
    orderMap[r._id] = r.totalOrders;
  });

  return restaurants.map((r) => ({
    ...r.toJSON(),
    owner: ownerMap[r.ownerId] || null,
    totalOrders: orderMap[r.id] || 0,
    totalRevenue: revenueMap[r.id]?.revenue || 0,
  }));
};

// ──────────────────────────────────────
//  GET PLATFORM DASHBOARD (with commission)
// ──────────────────────────────────────
const getPlatformDashboard = async (period = "all") => {
  // Build date filter
  const dateFilter = {};
  const now = new Date();

  if (period === "today") {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dateFilter.createdAt = { $gte: startOfDay };
  } else if (period === "month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter.createdAt = { $gte: startOfMonth };
  } else if (period === "year") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    dateFilter.createdAt = { $gte: startOfYear };
  }

  // Total restaurants count
  const totalRestaurants = await Restaurant.count();

  // Total orders in period
  const totalOrders = await Order.countDocuments({
    ...dateFilter,
  });

  // Revenue aggregation (delivered orders in period)
  const revenueMatch = { status: "delivered", ...dateFilter };
  const revenueResult = await Order.aggregate([
    { $match: revenueMatch },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const grossRevenue = revenueResult[0]?.total || 0;
  const platformCommission = Math.round(grossRevenue * PLATFORM_COMMISSION_RATE);
  const restaurantNetRevenue = grossRevenue - platformCommission;

  // Unique customers today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayCustomers = await Order.distinct("userId", {
    createdAt: { $gte: startOfToday },
  });

  // Today's orders count
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: startOfToday },
  });

  // Active orders (across all)
  const activeOrders = await Order.countDocuments({
    status: { $in: ["confirmed", "preparing", "out_for_delivery"] },
  });

  // Order status breakdown in period
  const statusBreakdown = await Order.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Per-restaurant revenue breakdown (delivered, in period)
  const perRestaurantRevenue = await Order.aggregate([
    { $match: revenueMatch },
    {
      $group: {
        _id: "$restaurantId",
        totalRevenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  // Enrich per-restaurant with names
  const restaurantIds = perRestaurantRevenue.map((r) => r._id);
  const restaurantRows = await Restaurant.findAll({
    where: { id: restaurantIds },
    attributes: ["id", "name"],
  });
  const nameMap = {};
  restaurantRows.forEach((r) => {
    nameMap[r.id] = r.name;
  });

  return {
    totalRestaurants,
    totalOrders,
    grossRevenue,
    platformCommission,
    restaurantNetRevenue,
    commissionRate: PLATFORM_COMMISSION_RATE * 100,
    todayCustomers: todayCustomers.length,
    todayOrders,
    activeOrders,
    ordersByStatus: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    perRestaurantRevenue: perRestaurantRevenue.map((r) => ({
      restaurantId: r._id,
      restaurantName: nameMap[r._id] || `Restaurant #${r._id}`,
      grossRevenue: r.totalRevenue,
      commission: Math.round(r.totalRevenue * PLATFORM_COMMISSION_RATE),
      netRevenue: r.totalRevenue - Math.round(r.totalRevenue * PLATFORM_COMMISSION_RATE),
      orderCount: r.orderCount,
    })),
  };
};

module.exports = {
  createRestaurantWithOwner,
  deleteRestaurant,
  getAllRestaurants,
  getPlatformDashboard,
};
