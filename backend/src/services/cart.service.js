const Cart = require("../models/cart.model");
const ApiError = require("../utils/ApiError");

//Add item to cart

const addToCart = async (userId, data) => {
  const { menuId, name, price, quantity, restaurantId } = data;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      restaurantId,
      items: [],
    });
  }

  // prevent multi-restaurant cart

  if (cart.restaurantId !== restaurantId) {
    throw new ApiError(400, "You can order from only one restaurant at a time");
  }

  const itemIndex = cart.items.findIndex((item) => item.menuId === menuId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      menuId,
      name,
      price,
      quantity
    });
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0
  );

  await cart.save();

  return cart;
};

//Get user cart

const getCart = async (userId) => {
  return await Cart.findOne({ userId });
};

// Remove item from cart

const removeItem = async (userId, menuId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((item) => item.menuId !== menuId);

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();

  return cart;
};

//clear cart

const clearCart = async (userId) => {
  await Cart.findOneAndDelete({ userId });
};

module.exports = {
  addToCart,
  getCart,
  removeItem,
  clearCart
};