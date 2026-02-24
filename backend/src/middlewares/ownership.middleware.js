const Restaurant = require("../models/restaurant.model");
const ApiError = require("../utils/ApiError");

/**
 * OWNERSHIP MIDDLEWARE
 * --------------------
 * Verifies that the logged-in user owns the restaurant they're trying to access.
 * Super admins bypass this check entirely.
 *
 * Usage: router.put("/:id", protect, authorizeRoles("restaurant_owner", "admin"), verifyOwnership, controller.update);
 */
const verifyOwnership = async (req, res, next) => {
  try {
    // Super admins bypass ownership check
    if (req.user.role === "admin") {
      return next();
    }

    // Get restaurant ID from various param names
    const restaurantId = req.params.id || req.params.restaurantId;

    if (!restaurantId) {
      return next(); // No restaurant ID in route — let the controller handle it
    }

    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }

    if (restaurant.ownerId !== req.user._id.toString()) {
      throw new ApiError(403, "You do not own this restaurant");
    }

    // Attach restaurant to req for downstream use
    req.restaurant = restaurant;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = verifyOwnership;
