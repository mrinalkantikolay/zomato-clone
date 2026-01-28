const adminService = require("../services/admin.service");
const OrderDTO = require("../dtos/order.dto");
const PaymentDTO = require("../dtos/payment.dto");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET ALL ORDERS (ADMIN) WITH PAGINATION
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const result = await adminService.getAllOrders(page, limit);

  res.status(200).json({
    success: true,
    ...OrderDTO.toPaginatedDTO(result),
  });
});

/**
 * UPDATE ORDER STATUS (ADMIN)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await adminService.updateOrderStatus(
    req.params.orderId,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Order status updated",
    data: OrderDTO.toDTO(order),
  });
});

/**
 * GET ALL PAYMENTS (ADMIN) WITH PAGINATION
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const result = await adminService.getAllPayments(page, limit);

  res.status(200).json({
    success: true,
    ...PaymentDTO.toPaginatedDTO(result),
  });
});

/**
 * GET DASHBOARD STATS (ADMIN)
 * No pagination needed
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getAllPayments,
  getDashboardStats,
};