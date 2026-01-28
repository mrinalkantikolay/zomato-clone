const { body, param } = require("express-validator");

const createRestaurantValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Restaurant name is required")
    .isLength({ min: 3, max: 100 }).withMessage("Name must be 3-100 characters"),

  body("address")
    .trim()
    .notEmpty().withMessage("Address is required")
    .isLength({ min: 5, max: 200 }).withMessage("Address must be 5-200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description max 500 characters"),

  body("imageUrl")
    .optional()
    .trim()
    .isURL().withMessage("Invalid image URL")
];

const updateRestaurantValidation = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid restaurant ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("Name must be 3-100 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage("Address must be 5-200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description max 500 characters")
];

const restaurantIdValidation = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid restaurant ID")
];

module.exports = {
  createRestaurantValidation,
  updateRestaurantValidation,
  restaurantIdValidation
};