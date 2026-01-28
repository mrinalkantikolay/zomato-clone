const restaurantService = require("../services/restaurant.service");
const { clearRestaurantCache } = require("../middlewares/cache.middleware");
const RestaurantDTO = require("../dtos/restaurant.dto");
const asyncHandler = require("../utils/asyncHandler");

/**
 * CREATE RESTAURANT (ADMIN)
 */
const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.createRestaurant(req.body);

  // Clear restaurant cache after creating new restaurant
  await clearRestaurantCache();

  res.status(201).json({
    success: true,
    message: "Restaurant created successfully",
    data: RestaurantDTO.toDTO(restaurant),
  });
});

/**
 * GET ALL RESTAURANTS (WITH PAGINATION)
 * ------------------------------------
 * Public API
 */
const getAllRestaurants = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const result = await restaurantService.getAllRestaurants(page, limit);

  res.status(200).json({
    success: true,
    ...RestaurantDTO.toPaginatedDTO(result),
  });
});

/**
 * GET SINGLE RESTAURANT
 */
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantById(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: RestaurantDTO.toDTO(restaurant),
  });
});

/**
 * UPDATE RESTAURANT (ADMIN)
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurant(
    req.params.id,
    req.body
  );

  // Clear restaurant cache after update
  await clearRestaurantCache();

  res.status(200).json({
    success: true,
    message: "Restaurant updated successfully",
    data: RestaurantDTO.toDTO(restaurant),
  });
});

/**
 * DELETE RESTAURANT (ADMIN)
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
  await restaurantService.deleteRestaurant(req.params.id);

  // Clear restaurant cache after delete
  await clearRestaurantCache();

  res.status(200).json({
    success: true,
    message: "Restaurant deleted successfully",
  });
});

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};