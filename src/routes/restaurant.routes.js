const express = require("express");
const router = express.Router();

const restaurantController = require("../controllers/restaurant.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  createRestaurantValidation,
  updateRestaurantValidation,
  restaurantIdValidation
} = require("../validations/restaurant.validation");
const handleValidationErrors = require("../middlewares/validation.middlewares");

// Redis Cache Middleware
const { cache } = require("../middlewares/cache.middleware");

// Public Routes - WITH CACHING
// Cache restaurant list for 5 minutes (300 seconds)
router.get("/", cache(300), restaurantController.getAllRestaurants);

// Cache single restaurant for 10 minutes (600 seconds)
router.get(
  "/:id",
  restaurantIdValidation,
  handleValidationErrors,
  cache(600),
  restaurantController.getRestaurantById
);

// Admin Routes
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createRestaurantValidation,
  handleValidationErrors,
  restaurantController.createRestaurant
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateRestaurantValidation,
  handleValidationErrors,
  restaurantController.updateRestaurant
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  restaurantIdValidation,
  handleValidationErrors,
  restaurantController.deleteRestaurant
);

module.exports = router;