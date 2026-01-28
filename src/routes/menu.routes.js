const express = require("express");
const router = express.Router();

const menuController = require("../controllers/menu.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  createMenuValidation,
  updateMenuValidation,
  menuIdValidation
} = require("../validations/menu.validation");

const handleValidationErrors = require("../middlewares/validation.middlewares");

// Redis Cache Middleware
const { cache } = require("../middlewares/cache.middleware");

// Public route - Get menu by restaurant (WITH CACHING)
// Cache menu for 5 minutes (300 seconds)
router.get("/restaurant/:restaurantId", cache(300), menuController.getMenuByRestaurant);

// Admin - Create menu item
router.post(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin"),
  createMenuValidation,
  handleValidationErrors,
  menuController.createMenuItem
);

// Admin - Update menu item
router.put(
  "/:menuId",
  protect,
  authorizeRoles("admin"),
  updateMenuValidation,
  handleValidationErrors,
  menuController.updateMenuItem
);

// Admin - Delete menu item
router.delete(
  "/:menuId",
  protect,
  authorizeRoles("admin"),
  menuIdValidation,
  handleValidationErrors,
  menuController.deleteMenuItem
);

module.exports = router;