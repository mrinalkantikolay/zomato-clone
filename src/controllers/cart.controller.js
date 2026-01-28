const cartService = require("../services/cart.service");
const CartDTO = require("../dtos/cart.dto");
const asyncHandler = require("../utils/asyncHandler");

//Add to cart

const addToCart = asyncHandler(async (req, res) => {
  const cart = await cartService.addToCart(req.user._id, req.body);

  res.status(200).json({
    success: true,
    data: CartDTO.toDTO(cart),
  });
});

// GET CART

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);

  res.status(200).json({
    success: true,
    data: CartDTO.toDTO(cart),
  });
});

// Remove item from cart

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id,
    Number(req.params.menuId)
  );

  res.status(200).json({
    success: true,
    data: CartDTO.toDTO(cart),
  });
});

module.exports = {
  addToCart,
  getCart,
  removeItem,
};