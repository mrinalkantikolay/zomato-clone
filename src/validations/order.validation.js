const { body, param } = require("express-validator");

const updateOrderStatusValidation = [
  param("orderId")
    .isMongoId().withMessage("Invalid order ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn([
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled"
    ]).withMessage("Invalid order status")
];

module.exports = {
  updateOrderStatusValidation
};