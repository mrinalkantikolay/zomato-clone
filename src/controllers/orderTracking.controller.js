const orderTrackingService = require("../services/orderTracking.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET ORDER TRACKING
 * ------------------
 * Get tracking details for a specific order
 */
const getOrderTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const trackingInfo = await orderTrackingService.getOrderTracking(orderId);

  res.status(200).json({
    success: true,
    data: trackingInfo,
  });
});

/**
 * UPDATE ORDER STATUS
 * -------------------
 * Update order status (Admin/Restaurant only)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const updatedBy = req.user?.role || "admin";

  const order = await orderTrackingService.updateOrderStatus(
    orderId,
    status,
    updatedBy
  );

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt,
    },
  });
});

/**
 * ASSIGN DELIVERY PARTNER
 * ------------------------
 * Assign a delivery partner to an order
 */
const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { deliveryPartnerId } = req.body;

  const order = await orderTrackingService.assignDeliveryPartner(
    orderId,
    deliveryPartnerId
  );

  res.status(200).json({
    success: true,
    message: "Delivery partner assigned successfully",
    data: {
      orderId: order._id,
      deliveryPartner: order.deliveryPartner,
    },
  });
});

/**
 * UPDATE DELIVERY LOCATION
 * -------------------------
 * Update delivery partner's location (called by delivery app)
 */
const updateDeliveryLocation = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { latitude, longitude } = req.body;

  const result = await orderTrackingService.updateDeliveryLocation(
    orderId,
    latitude,
    longitude
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * MARK AS DELIVERED
 * -----------------
 * Mark order as delivered
 */
const markAsDelivered = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { deliveryPartnerId } = req.body;

  const order = await orderTrackingService.markAsDelivered(
    orderId,
    deliveryPartnerId
  );

  res.status(200).json({
    success: true,
    message: "Order marked as delivered",
    data: {
      orderId: order._id,
      status: order.status,
    },
  });
});

module.exports = {
  getOrderTracking,
  updateOrderStatus,
  assignDeliveryPartner,
  updateDeliveryLocation,
  markAsDelivered,
};
