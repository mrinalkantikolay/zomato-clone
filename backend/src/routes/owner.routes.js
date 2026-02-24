/**
 * OWNER ROUTES
 * -------------
 * All routes require authentication + restaurant_owner or admin role.
 * Ownership is verified via middleware where needed.
 *
 * Base: /api/v1/owner
 */

const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const verifyOwnership = require("../middlewares/ownership.middleware");
const ownerController = require("../controllers/owner.controller");

// All routes require auth + restaurant_owner (or admin)
const ownerAuth = [protect, authorizeRoles("restaurant_owner", "admin")];

// ──────────────────────────────────────
//  DASHBOARD
// ──────────────────────────────────────
router.get("/dashboard", ...ownerAuth, ownerController.getDashboardStats);

// ──────────────────────────────────────
//  RESTAURANTS (read + edit only — create/delete is Super Admin)
// ──────────────────────────────────────
router.get("/restaurants", ...ownerAuth, ownerController.getOwnerRestaurants);
router.put(
  "/restaurants/:id",
  ...ownerAuth,
  verifyOwnership,
  ownerController.updateRestaurant
);

// ──────────────────────────────────────
//  MENU CRUD (scoped to restaurant)
// ──────────────────────────────────────
router.get(
  "/restaurants/:id/menu",
  ...ownerAuth,
  verifyOwnership,
  ownerController.getMenuByRestaurant
);
router.post(
  "/restaurants/:id/menu",
  ...ownerAuth,
  verifyOwnership,
  ownerController.createMenuItem
);
router.put(
  "/menu/:menuId",
  ...ownerAuth,
  ownerController.updateMenuItem
);
router.delete(
  "/menu/:menuId",
  ...ownerAuth,
  ownerController.deleteMenuItem
);

// ──────────────────────────────────────
//  ORDERS
// ──────────────────────────────────────
router.get("/orders", ...ownerAuth, ownerController.getOwnerOrders);
router.put(
  "/orders/:orderId/status",
  ...ownerAuth,
  ownerController.updateOrderStatus
);

// ──────────────────────────────────────
//  LIVE TRACKING
// ──────────────────────────────────────
router.get(
  "/tracking/active-orders",
  ...ownerAuth,
  ownerController.getActiveOrdersForTracking
);

module.exports = router;
