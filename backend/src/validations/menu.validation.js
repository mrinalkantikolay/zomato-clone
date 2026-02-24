const { body, param } = require("express-validator");

const createMenuValidation = [
  param("restaurantId")
    .isInt({ min: 1 }).withMessage("Invalid restaurant ID"),

  body("name")
    .trim()
    .notEmpty().withMessage("Menu item name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Description max 300 characters"),

  body("imageUrl")
    .optional()
    .trim()
    .isURL().withMessage("Invalid image URL")
];

const updateMenuValidation = [
  param("menuId")
    .isInt({ min: 1 }).withMessage("Invalid menu ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Description max 300 characters")
];

const menuIdValidation = [
  param("menuId")
    .isInt({ min: 1 }).withMessage("Invalid menu ID")
];

module.exports = {
  createMenuValidation,
  updateMenuValidation,
  menuIdValidation
};