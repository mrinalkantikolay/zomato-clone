const Restaurant = require("../models/restaurant.model");
const Menu = require("../models/menu.model");
const Order = require("../models/order.model");
const Payment = require("../models/payment.model");
const paginate = require("../utils/paginate");
const ApiError = require("../utils/ApiError");

// ══════════════════════════════════════════════
//  RESTAURANT OWNER SERVICE
//  All queries are scoped to the owner's restaurants
// ══════════════════════════════════════════════

const PLATFORM_COMMISSION_RATE = 0.20; // 20%

/**
 * GET OWNER DASHBOARD STATS
 * Supports period filter: today, month, year, all
 */
const getDashboardStats = async (ownerId, period = "all") => {
  // Get owner's restaurant IDs
  const restaurants = await Restaurant.findAll({
    where: { ownerId },
    attributes: ["id", "name"],
  });
  const restaurantIds = restaurants.map((r) => r.id);

  if (restaurantIds.length === 0) {
    return {
      totalRestaurants: 0,
      totalOrders: 0,
      grossRevenue: 0,
      netRevenue: 0,
      platformCommission: 0,
      activeOrders: 0,
      todayOrders: 0,
      todayCustomers: 0,
      ordersByStatus: {},
      perRestaurantRevenue: [],
    };
  }

  // Build date filter
  const dateFilter = { restaurantId: { $in: restaurantIds } };
  const now = new Date();

  if (period === "today") {
    dateFilter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
  } else if (period === "month") {
    dateFilter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  } else if (period === "year") {
    dateFilter.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };
  }

  // Total orders in period
  const totalOrders = await Order.countDocuments(dateFilter);

  // Active orders (always real-time)
  const activeOrders = await Order.countDocuments({
    restaurantId: { $in: restaurantIds },
    status: { $in: ["confirmed", "preparing", "out_for_delivery"] },
  });

  // Revenue (delivered in period)
  const revenueMatch = { ...dateFilter, status: "delivered" };
  const revenueResult = await Order.aggregate([
    { $match: revenueMatch },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const grossRevenue = revenueResult[0]?.total || 0;
  const platformCommission = Math.round(grossRevenue * PLATFORM_COMMISSION_RATE);
  const netRevenue = grossRevenue - platformCommission;

  // Today's unique customers
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayCustomers = await Order.distinct("userId", {
    restaurantId: { $in: restaurantIds },
    createdAt: { $gte: startOfToday },
  });

  // Today's orders
  const todayOrders = await Order.countDocuments({
    restaurantId: { $in: restaurantIds },
    createdAt: { $gte: startOfToday },
  });

  // Order status breakdown in period
  const statusBreakdown = await Order.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Per-restaurant revenue
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

  const nameMap = {};
  restaurants.forEach((r) => { nameMap[r.id] = r.name; });

  // Recent orders (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOrdersCount = await Order.countDocuments({
    restaurantId: { $in: restaurantIds },
    createdAt: { $gte: sevenDaysAgo },
  });

  return {
    totalRestaurants: restaurantIds.length,
    totalOrders,
    grossRevenue,
    netRevenue,
    platformCommission,
    commissionRate: PLATFORM_COMMISSION_RATE * 100,
    activeOrders,
    todayOrders,
    todayCustomers: todayCustomers.length,
    recentOrdersCount,
    ordersByStatus: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    perRestaurantRevenue: perRestaurantRevenue.map((r) => ({
      restaurantId: r._id,
      restaurantName: nameMap[r._id] || `Restaurant #${r._id}`,
      grossRevenue: r.totalRevenue,
      netRevenue: r.totalRevenue - Math.round(r.totalRevenue * PLATFORM_COMMISSION_RATE),
      orderCount: r.orderCount,
    })),
  };
};

/**
 * GET OWNER'S RESTAURANTS
 */
const getOwnerRestaurants = async (ownerId, page = 1, limit = 20) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const { rows, count } = await Restaurant.findAndCountAll({
    where: { ownerId },
    offset: skip,
    limit: pageLimit,
    order: [["createdAt", "DESC"]],
  });

  return {
    total: count,
    page: currentPage,
    limit: pageLimit,
    data: rows,
  };
};

/**
 * CREATE RESTAURANT (auto-links ownerId)
 */
const createRestaurant = async (ownerId, data) => {
  const { name, address, description, imageUrl, cuisine } = data;

  if (!name || !address) {
    throw new ApiError(400, "Restaurant name and address are required");
  }

  return await Restaurant.create({
    name,
    address,
    description,
    imageUrl,
    cuisine,
    ownerId,
  });
};

/**
 * UPDATE RESTAURANT (ownership verified by middleware)
 */
const updateRestaurant = async (id, data) => {
  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  await restaurant.update(data);
  return restaurant;
};

/**
 * DELETE RESTAURANT (ownership verified by middleware)
 */
const deleteRestaurant = async (id) => {
  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  // Delete associated menu items first
  await Menu.destroy({ where: { restaurantId: id } });
  await restaurant.destroy();
};

/**
 * GET MENU FOR OWNER'S RESTAURANT
 */
const getMenuByRestaurant = async (restaurantId, page = 1, limit = 50) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const { rows, count } = await Menu.findAndCountAll({
    where: { restaurantId },
    offset: skip,
    limit: pageLimit,
    order: [["createdAt", "DESC"]],
  });

  return {
    total: count,
    page: currentPage,
    limit: pageLimit,
    data: rows,
  };
};

/**
 * CREATE MENU ITEM
 */
const createMenuItem = async (restaurantId, data) => {
  const { name, price, description, imageUrl, category, isVeg, isAvailable } = data;

  if (!name || !price) {
    throw new ApiError(400, "Menu item name and price are required");
  }

  return await Menu.create({
    name,
    price,
    description,
    imageUrl,
    category,
    isVeg: isVeg ?? true,
    isAvailable: isAvailable ?? true,
    restaurantId,
  });
};

/**
 * UPDATE MENU ITEM (ownership verified by middleware on restaurant)
 */
const updateMenuItem = async (menuId, data) => {
  const menu = await Menu.findByPk(menuId);
  if (!menu) throw new ApiError(404, "Menu item not found");

  await menu.update(data);
  return menu;
};

/**
 * DELETE MENU ITEM
 */
const deleteMenuItem = async (menuId) => {
  const menu = await Menu.findByPk(menuId);
  if (!menu) throw new ApiError(404, "Menu item not found");

  await menu.destroy();
};

/**
 * GET ORDERS FOR OWNER'S RESTAURANTS
 */
const getOwnerOrders = async (ownerId, page = 1, limit = 10, status = null) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  // Get owner's restaurant IDs
  const restaurants = await Restaurant.findAll({
    where: { ownerId },
    attributes: ["id"],
  });
  const restaurantIds = restaurants.map((r) => r.id);

  if (restaurantIds.length === 0) {
    return { total: 0, page: 1, limit: pageLimit, data: [] };
  }

  const query = { restaurantId: { $in: restaurantIds } };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Order.countDocuments(query);

  return {
    total,
    page: currentPage,
    limit: pageLimit,
    data: orders,
  };
};

/**
 * UPDATE ORDER STATUS (owner can update orders for their restaurants)
 */
const updateOrderStatus = async (ownerId, orderId, status) => {
  // Validate the order belongs to owner's restaurant
  const restaurants = await Restaurant.findAll({
    where: { ownerId },
    attributes: ["id"],
  });
  const restaurantIds = restaurants.map((r) => r.id);

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (!restaurantIds.includes(order.restaurantId)) {
    throw new ApiError(403, "This order does not belong to your restaurant");
  }

  order.status = status;
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: "restaurant_owner",
  });
  await order.save();

  return order;
};

/**
 * GET ACTIVE ORDERS FOR TRACKING
 */
const getActiveOrdersForTracking = async (ownerId) => {
  const restaurants = await Restaurant.findAll({
    where: { ownerId },
    attributes: ["id", "name", "address"],
  });
  const restaurantIds = restaurants.map((r) => r.id);
  const restaurantMap = {};
  restaurants.forEach((r) => {
    restaurantMap[r.id] = { name: r.name, address: r.address };
  });

  if (restaurantIds.length === 0) return [];

  const activeStatuses = ["confirmed", "preparing", "out_for_delivery"];

  const orders = await Order.find({
    restaurantId: { $in: restaurantIds },
    status: { $in: activeStatuses },
  })
    .populate("userId", "name phone")
    .sort({ createdAt: -1 });

  return orders.map((order) => ({
    orderId: order._id,
    status: order.status,
    customer: order.userId,
    restaurant: restaurantMap[order.restaurantId] || {},
    totalAmount: order.totalAmount,
    deliveryLocation: order.deliveryLocation,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    createdAt: order.createdAt,
  }));
};

module.exports = {
  getDashboardStats,
  getOwnerRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMenuByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOwnerOrders,
  updateOrderStatus,
  getActiveOrdersForTracking,
};
