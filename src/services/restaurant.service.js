const Restaurant = require("../models/restaurant.model");
const paginate = require("../utils/paginate");
const ApiError = require("../utils/ApiError");

/**
 * CREATE RESTAURANT
 * -----------------
 * Admin creates restaurant
 */
const createRestaurant = async (data) => {
  const { name, address, description, imageUrl } = data;

  if (!name || !address) {
    throw new ApiError(400, "Restaurant name and address are required");
  }

  return await Restaurant.create({
    name,
    address,
    description,
    imageUrl,
  });
};

/**
 * GET ALL RESTAURANTS (WITH PAGINATION)
 * ------------------------------------
 * Public API
 */
const getAllRestaurants = async (page = 1, limit = 10) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const { rows, count } = await Restaurant.findAndCountAll({
    offset: skip,
    limit: pageLimit,
    order: [["createdAt", "DESC"]],
  });

  return {
    total: count,
    page: currentPage,
    limit: pageLimit,
    data: rows,
  };
};

/**
 * GET SINGLE RESTAURANT
 * ---------------------
 */
const getRestaurantById = async (id) => {
  const restaurant = await Restaurant.findByPk(id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return restaurant;
};

/**
 * UPDATE RESTAURANT
 * -----------------
 * Admin only
 */
const updateRestaurant = async (id, data) => {
  const restaurant = await Restaurant.findByPk(id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  await restaurant.update(data);
  return restaurant;
};

/**
 * DELETE RESTAURANT
 * -----------------
 * Admin only
 */
const deleteRestaurant = async (id) => {
  const restaurant = await Restaurant.findByPk(id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  await restaurant.destroy();
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};