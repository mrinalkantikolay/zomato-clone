const menuService = require("../services/menu.service");
const { clearMenuCache } = require("../middlewares/cache.middleware");
const MenuDTO = require("../dtos/menu.dto");
const asyncHandler = require("../utils/asyncHandler");

/**
 * CREATE MENU ITEM
 * ----------------
 * Admin creates menu item for a restaurant
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const menu = await menuService.createMenuItem(
    req.params.restaurantId,
    req.body
  );

  // Clear menu cache for this restaurant after creating new item
  await clearMenuCache(req.params.restaurantId);

  res.status(201).json({
    success: true,
    message: "Menu item created",
    data: MenuDTO.toDTO(menu),
  });
});

/**
 * GET MENU BY RESTAURANT (WITH PAGINATION)
 * ---------------------------------------
 * Public API
 */
const getMenuByRestaurant = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const result = await menuService.getMenuByRestaurant(
    req.params.restaurantId,
    page,
    limit
  );

  res.status(200).json({
    success: true,
    ...MenuDTO.toPaginatedDTO(result),
  });
});

/**
 * UPDATE MENU ITEM
 * ----------------
 * Admin only
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const menu = await menuService.updateMenuItem(
    req.params.id,
    req.body
  );

  // Clear all menu cache after update (we don't know which restaurant)
  await clearMenuCache();

  res.status(200).json({
    success: true,
    message: "Menu item updated",
    data: MenuDTO.toDTO(menu),
  });
});

/**
 * DELETE MENU ITEM
 * ----------------
 * Admin only
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  await menuService.deleteMenuItem(req.params.id);

  // Clear all menu cache after delete
  await clearMenuCache();

  res.status(200).json({
    success: true,
    message: "Menu item deleted",
  });
});

module.exports = {
  createMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
};