const ownerService = require("../services/owner.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET DASHBOARD STATS (owner-scoped)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const period = req.query.period || "all";
  const stats = await ownerService.getDashboardStats(req.user._id.toString(), period);

  res.status(200).json({ success: true, data: stats });
});

/**
 * GET OWNER'S RESTAURANTS
 */
const getOwnerRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await ownerService.getOwnerRestaurants(
    req.user._id.toString(),
    page,
    limit
  );

  res.status(200).json({ success: true, ...result });
});

/**
 * CREATE RESTAURANT (auto-links ownerId)
 */
const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await ownerService.createRestaurant(
    req.user._id.toString(),
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Restaurant created successfully",
    data: restaurant,
  });
});

/**
 * UPDATE RESTAURANT
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await ownerService.updateRestaurant(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Restaurant updated successfully",
    data: restaurant,
  });
});

/**
 * DELETE RESTAURANT
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
  await ownerService.deleteRestaurant(req.params.id);

  res.status(200).json({
    success: true,
    message: "Restaurant deleted successfully",
  });
});

/**
 * GET MENU BY RESTAURANT
 */
const getMenuByRestaurant = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await ownerService.getMenuByRestaurant(
    req.params.id,
    page,
    limit
  );

  res.status(200).json({ success: true, ...result });
});

/**
 * CREATE MENU ITEM
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const menu = await ownerService.createMenuItem(req.params.id, req.body);

  res.status(201).json({
    success: true,
    message: "Menu item created",
    data: menu,
  });
});

/**
 * UPDATE MENU ITEM
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const menu = await ownerService.updateMenuItem(req.params.menuId, req.body);

  res.status(200).json({
    success: true,
    message: "Menu item updated",
    data: menu,
  });
});

/**
 * DELETE MENU ITEM
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  await ownerService.deleteMenuItem(req.params.menuId);

  res.status(200).json({
    success: true,
    message: "Menu item deleted",
  });
});

/**
 * GET ORDERS FOR OWNER'S RESTAURANTS
 */
const getOwnerOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const result = await ownerService.getOwnerOrders(
    req.user._id.toString(),
    page,
    limit,
    status || null
  );

  res.status(200).json({ success: true, ...result });
});

/**
 * UPDATE ORDER STATUS
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await ownerService.updateOrderStatus(
    req.user._id.toString(),
    req.params.orderId,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

/**
 * GET ACTIVE ORDERS FOR LIVE TRACKING
 */
const getActiveOrdersForTracking = asyncHandler(async (req, res) => {
  const orders = await ownerService.getActiveOrdersForTracking(
    req.user._id.toString()
  );

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

module.exports = {
  getDashboardStats,
  getOwnerRestaurants,
  updateRestaurant,
  getMenuByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOwnerOrders,
  updateOrderStatus,
  getActiveOrdersForTracking,
};
