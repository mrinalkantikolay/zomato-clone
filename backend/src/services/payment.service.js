const Payment = require("../models/payment.model");
const Order = require("../models/order.model");
const paginate = require("../utils/paginate");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");

/**
 * DUMMY RAZORPAY ORDER CREATION
 * ----------------------------
 * Simulates Razorpay order creation
 */
const createRazorpayOrder = async (userId, orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const razorpayOrderId =
    "rzp_order_" + crypto.randomBytes(8).toString("hex");

  const payment = await Payment.create({
    userId,
    orderId,
    amount: order.totalAmount,
    method: "razorpay",
    status: "initiated",
    razorpayOrderId,
  });

  return payment;
};

/**
 * RAZORPAY PAYMENT VERIFICATION (DUMMY)
 * ------------------------------------
 * Simulates Razorpay signature verification
 */
const verifyRazorpayPayment = async (data) => {
  const {
    paymentId,
    razorpayPaymentId,
    razorpaySignature,
    success,
  } = data;

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  if (success) {
    payment.status = "success";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;

    // Update order status after successful payment
    await Order.findByIdAndUpdate(payment.orderId, {
      status: "confirmed",
    });
  } else {
    payment.status = "failed";
  }

  await payment.save();
  return payment;
};

/**
 * GET USER PAYMENTS (WITH PAGINATION)
 * ----------------------------------
 * User payment history
 */
const getUserPayments = async (userId, page = 1, limit = 10) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const payments = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Payment.countDocuments({ userId });

  return {
    total,
    page: currentPage,
    limit: pageLimit,
    data: payments,
  };
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getUserPayments,
};