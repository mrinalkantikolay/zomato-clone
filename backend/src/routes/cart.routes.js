/**
 * CART ROUTES
 */

const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

const { addToCartValidation, removeItemValidation } = require("../validations/cart.validation");
const handleValidationErrors = require("../middlewares/validation.middlewares");

router.post(
  "/",
  protect,
  addToCartValidation,
  handleValidationErrors,
  cartController.addToCart
);

router.get("/", protect, cartController.getCart);

router.delete(
  "/:menuId",
  protect,
  removeItemValidation,
  handleValidationErrors,
  cartController.removeItem
);

module.exports = router;