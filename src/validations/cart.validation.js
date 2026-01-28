const { body, param } = require("express-validator");

const addToCartValidation = [
  body("menuId")
    .notEmpty().withMessage("Menu ID is required")
    .isInt({ min: 1 }).withMessage("Invalid menu ID"),

  body("name")
    .trim()
    .notEmpty().withMessage("Item name is required"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be positive"),

  body("quantity")
    .notEmpty().withMessage("Quantity is required")
    .isInt({ min: 1, max: 50 }).withMessage("Quantity must be 1-50"),

  body("restaurantId")
    .notEmpty().withMessage("Restaurant ID is required")
    .isInt({ min: 1 }).withMessage("Invalid restaurant ID")
];

const removeItemValidation = [
  param("menuId")
    .isInt({ min: 1 }).withMessage("Invalid menu ID")
];

module.exports = {
  addToCartValidation,
  removeItemValidation
};