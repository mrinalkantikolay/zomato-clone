const Menu = require("../models/menu.model");
const Restaurant = require("../models/restaurant.model");
const paginate = require("../utils/paginate");
const ApiError = require("../utils/ApiError");

/**
 * CREATE MENU ITEM
 * ----------------
 * Admin creates menu item for a restaurant
 */
const createMenuItem = async (restaurantId, data) => {
  const { name, price, description, imageUrl } = data;

  if (!name || !price) {
    throw new ApiError(400, "Menu name and price are required");
  }

  // Check restaurant exists
  const restaurant = await Restaurant.findByPk(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return await Menu.create({
    name,
    price,
    description,
    imageUrl,
    restaurantId,
  });
};

/**
 * GET ALL MENU ITEMS BY RESTAURANT (WITH PAGINATION)
 * -------------------------------------------------
 * Public API
 */
const getMenuByRestaurant = async (restaurantId, page = 1, limit = 10) => {
  const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

  const { rows, count } = await Menu.findAndCountAll({
    where: { restaurantId },
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
 * UPDATE MENU ITEM
 * ----------------
 * Admin only
 */
const updateMenuItem = async (menuId, data) => {
  const menu = await Menu.findByPk(menuId);

  if (!menu) {
    throw new ApiError(404, "Menu item not found");
  }

  await menu.update(data);
  return menu;
};

/**
 * DELETE MENU ITEM
 * ----------------
 * Admin only
 */
const deleteMenuItem = async (menuId) => {
  const menu = await Menu.findByPk(menuId);

  if (!menu) {
    throw new ApiError(404, "Menu item not found");
  }

  await menu.destroy();
};

module.exports = {
  createMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
};