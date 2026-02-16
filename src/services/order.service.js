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

  // Create order
  const order = await Order.create({
    userId,
    restaurantId: cart.restaurantId,
    items: cart.items,
    totalAmount: cart.totalAmount,
    deliveryAddress: address || null,
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

module.exports = {
  placeOrder,
  getUserOrders,
};