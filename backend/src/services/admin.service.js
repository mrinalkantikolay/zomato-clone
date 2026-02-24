const Order = require("../models/order.model");
const Payment = require("../models/payment.model");
const paginate = require("../utils/paginate");
const ApiError = require("../utils/ApiError");

/**
 * GET ALL ORDERS (ADMIN) WITH PAGINATION
 * 
 * Used for admin order listing
 */
const getAllOrders = async (page = 1, limit = 10) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Order.countDocuments();

  return {
    total,
    page: currentPage,
    limit: pageLimit,
    data: orders,
  };
};

/**
 * GET ORDER BY ID (HELPER)
 * Used for audit logging to get old status before update
 */
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  return order;
};

/**
 * UPDATE ORDER STATUS (ADMIN)
 * Updates status of a single order
 */
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = status;
  await order.save();

  return order;
};

/**
 * GET ALL PAYMENTS (ADMIN) WITH PAGINATION
 * 
 * Used for admin payment listing
 */
const getAllPayments = async (page = 1, limit = 10) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const payments = await Payment.find()
    .populate("userId", "name email")
    .populate("orderId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Payment.countDocuments();

  return {
    total,
    page: currentPage,
    limit: pageLimit,
    data: payments,
  };
};

/**
 * ADMIN DASHBOARD STATS
 * --------------------
 * Aggregated numbers (no pagination needed)
 */
const getDashboardStats = async () => {
  const totalOrders = await Order.countDocuments();
  const totalPayments = await Payment.countDocuments();
  const successfulPayments = await Payment.countDocuments({
    status: "success",
  });

  return {
    totalOrders,
    totalPayments,
    successfulPayments,
  };
};

/**
 * GET ALL ACTIVE ORDERS FOR LIVE TRACKING
 * ----------------------------------------
 * Returns all orders currently being delivered with live locations
 */
const getActiveOrdersForTracking = async () => {
  const activeStatuses = ["confirmed", "preparing", "out_for_delivery"];

  const orders = await Order.find({ status: { $in: activeStatuses } })
    .populate("deliveryPartner")
    .populate("userId", "name phone")
    .populate("restaurantId")
    .sort({ createdAt: -1 });

  // Get live locations from Redis for faster access
  const ordersWithLiveLocation = await Promise.all(
    orders.map(async (order) => {
      let liveLocation = null;

      if (order.deliveryPartner) {
        const redisService = require("./redis.service");
        liveLocation = await redisService.getCachedDeliveryLocation(order._id);
      }

      return {
        orderId: order._id,
        status: order.status,
        userId: order.userId,
        restaurantId: order.restaurantId,
        totalAmount: order.totalAmount,
        deliveryPartner: order.deliveryPartner,
        deliveryLocation: liveLocation || order.deliveryLocation,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        createdAt: order.createdAt,
      };
    })
  );

  return ordersWithLiveLocation;
};

/**
 * GET ALL DELIVERY PARTNER LOCATIONS
 * -----------------------------------
 * Returns current locations of all delivery partners for map view
 */
const getAllDeliveryPartnerLocations = async () => {
  const DeliveryPartner = require("../models/deliveryPartner.model");

  const partners = await DeliveryPartner.find({})
    .populate("activeOrders")
    .select("name phone currentLocation isAvailable activeOrders vehicleType rating");

  return partners.map((partner) => ({
    partnerId: partner._id,
    name: partner.name,
    phone: partner.phone,
    location: partner.currentLocation,
    isAvailable: partner.isAvailable,
    activeOrdersCount: partner.activeOrders.length,
    activeOrders: partner.activeOrders,
    vehicleType: partner.vehicleType,
    rating: partner.rating,
  }));
};

/**
 * GET LIVE TRACKING STATISTICS
 * -----------------------------
 * Real-time stats for admin dashboard
 */
const getLiveTrackingStats = async () => {
  const DeliveryPartner = require("../models/deliveryPartner.model");

  const [totalOrders, activeOrders, totalPartners, availablePartners] = await Promise.all([
    Order.countDocuments({}),
    Order.countDocuments({ status: { $in: ["confirmed", "preparing", "out_for_delivery"] } }),
    DeliveryPartner.countDocuments({}),
    DeliveryPartner.countDocuments({ isAvailable: true }),
  ]);

  // Get order status breakdown
  const statusBreakdown = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    totalOrders,
    activeOrders,
    totalDeliveryPartners: totalPartners,
    availableDeliveryPartners: availablePartners,
    busyDeliveryPartners: totalPartners - availablePartners,
    ordersByStatus: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllPayments,
  getDashboardStats,
  getActiveOrdersForTracking,
  getAllDeliveryPartnerLocations,
  getLiveTrackingStats,
};