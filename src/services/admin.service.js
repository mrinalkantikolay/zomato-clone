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

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getAllPayments,
  getDashboardStats,
};