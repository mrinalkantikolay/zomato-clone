/**
 * ADMIN ROUTES
 * ------------
 * All routes are ADMIN ONLY
 */

const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin.controller");

const { updateOrderStatusValidation } = require("../validations/order.validation");
const handleValidationErrors = require("../middlewares/validation.middlewares");

/**
 * ORDERS
 */
router.get(
  "/orders",
  protect,
  authorizeRoles("admin"),
  adminController.getAllOrders
);

router.put(
  "/orders/:orderId",
  protect,
  authorizeRoles("admin"),
  updateOrderStatusValidation,
  handleValidationErrors,
  adminController.updateOrderStatus
);

/**
 * PAYMENTS
 */
router.get(
  "/payments",
  protect,
  authorizeRoles("admin"),
  adminController.getAllPayments
);

/**
 * DASHBOARD
 */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  adminController.getDashboardStats
);

module.exports = router;