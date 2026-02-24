const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const paginate = require("../utils/paginate");
const ApiError = require("../utils/ApiError");

/**
 * PLACE ORDER
 * -----------
 * Converts cart into order (no transaction — works on standalone MongoDB)
 */
const placeOrder = async (userId, address) => {
  // Find cart
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Create order as PENDING — restaurant owner must confirm
  const now = new Date();
  const order = await Order.create({
    userId,
    restaurantId: cart.restaurantId,
    items: cart.items,
    totalAmount: cart.totalAmount,
    deliveryAddress: address || null,
    status: "pending",
    estimatedDeliveryTime: new Date(now.getTime() + 40 * 60 * 1000), // +40 min
    statusHistory: [
      { status: "pending", timestamp: now, updatedBy: "system" },
    ],
  });

  // Clear cart after order placement
  await Cart.findOneAndDelete({ userId });

  return order;
};

/**
 * GET USER ORDERS (WITH PAGINATION)
 * --------------------------------
 * User order history
 */
const getUserOrders = async (userId, page = 1, limit = 10) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Order.countDocuments({ userId });

  return {
    total,
    page: currentPage,
    limit: pageLimit,
    data: orders,
  };
};

/**
 * GET SINGLE ORDER BY ID
 * ----------------------
 * Customer can fetch their own order status
 */
const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Not your order");
  }
  return order;
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
};