const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const paginate = require("../utils/paginate");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

/**
 * PLACE ORDER WITH DATABASE TRANSACTION
 * ------------------------------------
 * Converts cart into order atomically
 */
const placeOrder = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find cart
    const cart = await Cart.findOne({ userId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    // Create order
    const order = await Order.create([{
      userId,
      restaurantId: cart.restaurantId,
      items: cart.items,
      totalAmount: cart.totalAmount,
    }], { session });

    // Clear cart after order placement
    await Cart.findOneAndDelete({ userId }, { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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