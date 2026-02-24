/**
 * SUPER ADMIN CONTROLLER
 * ----------------------
 * Handles platform-level admin operations.
 */

const superadminService = require("../services/superadmin.service");

// GET /api/v1/superadmin/dashboard?period=today|month|year
const getPlatformDashboard = async (req, res, next) => {
  try {
    const period = req.query.period || "all";
    const stats = await superadminService.getPlatformDashboard(period);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/superadmin/restaurants
const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await superadminService.getAllRestaurants();
    res.json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/superadmin/restaurants
const createRestaurantWithOwner = async (req, res, next) => {
  try {
    const { restaurant, ownerName, ownerEmail } = req.body;
    const result = await superadminService.createRestaurantWithOwner(
      restaurant || {},
      ownerName,
      ownerEmail
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/superadmin/restaurants/:id
const deleteRestaurant = async (req, res, next) => {
  try {
    const result = await superadminService.deleteRestaurant(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformDashboard,
  getAllRestaurants,
  createRestaurantWithOwner,
  deleteRestaurant,
};
