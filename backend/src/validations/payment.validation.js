const { body } = require("express-validator");

const createPaymentValidation = [
  body("orderId")
    .notEmpty().withMessage("Order ID is required")
    .isMongoId().withMessage("Invalid order ID")
];

const verifyPaymentValidation = [
  body("paymentId")
    .notEmpty().withMessage("Payment ID is required")
    .isMongoId().withMessage("Invalid payment ID"),

  body("success")
    .isBoolean().withMessage("Success must be boolean"),

  body("razorpayPaymentId")
    .optional()
    .trim(),

  body("razorpaySignature")
    .optional()
    .trim()
];

module.exports = {
  createPaymentValidation,
  verifyPaymentValidation
};