/**
 * SUPER ADMIN ROUTES
 * ------------------
 * All routes require admin role only.
 * Base: /api/v1/superadmin
 */

const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const superadminController = require("../controllers/superadmin.controller");

// All routes require auth + admin role
const adminAuth = [protect, authorizeRoles("admin")];

// Dashboard
router.get("/dashboard", ...adminAuth, superadminController.getPlatformDashboard);

// Restaurants
router.get("/restaurants", ...adminAuth, superadminController.getAllRestaurants);
router.post("/restaurants", ...adminAuth, superadminController.createRestaurantWithOwner);
router.delete("/restaurants/:id", ...adminAuth, superadminController.deleteRestaurant);

module.exports = router;
