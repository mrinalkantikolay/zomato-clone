const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const paymentController = require("../controllers/payment.controller");

const { createPaymentValidation, verifyPaymentValidation } = require("../validations/payment.validation");
const handleValidationErrors = require("../middlewares/validation.middlewares");

router.post(
  "/",
  protect,
  createPaymentValidation,
  handleValidationErrors,
  paymentController.createPayment
);

router.post(
  "/verify",
  protect,
  verifyPaymentValidation,
  handleValidationErrors,
  paymentController.verifyPayment
);

// Get user payments
router.get("/", protect, paymentController.getUserPayments);

module.exports = router;