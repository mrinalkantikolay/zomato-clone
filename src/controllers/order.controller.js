const orderService = require("../services/order.service");
const OrderDTO = require("../dtos/order.dto");
const asyncHandler = require("../utils/asyncHandler");

/**
 * PLACE ORDER
 * -----------
 * Converts cart into order
 */
const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user._id, req.body.address);

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: OrderDTO.toDTO(order),
  });
});

/**
 * GET USER ORDERS (WITH PAGINATION)
 * --------------------------------
 * User order history
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const result = await orderService.getUserOrders(
    req.user._id,
    page,
    limit
  );

  res.status(200).json({
    success: true,
    ...OrderDTO.toPaginatedDTO(result),
  });
});

module.exports = {
  placeOrder,
  getUserOrders,
};