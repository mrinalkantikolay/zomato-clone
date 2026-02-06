const Order = require("../models/order.model");
const DeliveryPartner = require("../models/deliveryPartner.model");
const ApiError = require("../utils/ApiError");
const { getIO } = require("../config/socket");
const redisService = require("./redis.service");

/**
 * UPDATE ORDER STATUS
 * -------------------
 * Updates order status and emits real-time event
 */
const updateOrderStatus = async (orderId, newStatus, updatedBy = "system") => {
  const order = await Order.findById(orderId).populate("deliveryPartner");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Validate status transition
  const validStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(400, "Invalid order status");
  }

  // Update status
  order.status = newStatus;

  // Add to status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
  });

  // Set estimated delivery time when out for delivery
  if (newStatus === "out_for_delivery" && !order.estimatedDeliveryTime) {
    order.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
  }

  // If delivered or cancelled, remove from Redis cache
  if (newStatus === "delivered" || newStatus === "cancelled") {
    await redisService.deleteCachedLocation(orderId);
    await redisService.removeActiveOrder(orderId);
  }

  await order.save();

  // Emit real-time event
  try {
    const io = getIO();
    io.to(`order:${orderId}`).emit("order:statusUpdated", {
      orderId: order._id,
      status: newStatus,
      timestamp: new Date(),
      deliveryPartner: order.deliveryPartner,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
    });
  } catch (error) {
    console.error("Socket emit error:", error);
  }

  return order;
};

/**
 * GET ORDER TRACKING INFO
 * -----------------------
 * Get complete tracking details for an order
 */
const getOrderTracking = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("deliveryPartner")
    .populate("userId", "name phone")
    .populate("restaurantId");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Try to get live location from Redis cache first (faster)
  let liveLocation = await redisService.getCachedDeliveryLocation(orderId);

  // If not in cache, use database location
  if (!liveLocation && order.deliveryLocation) {
    liveLocation = {
      latitude: order.deliveryLocation.latitude,
      longitude: order.deliveryLocation.longitude,
      timestamp: order.deliveryLocation.updatedAt,
    };
  }

  return {
    orderId: order._id,
    status: order.status,
    items: order.items,
    totalAmount: order.totalAmount,
    statusHistory: order.statusHistory || [],
    deliveryPartner: order.deliveryPartner,
    deliveryLocation: liveLocation || order.deliveryLocation,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/**
 * ASSIGN DELIVERY PARTNER
 * ------------------------
 * Assign a delivery partner to an order
 */
const assignDeliveryPartner = async (orderId, deliveryPartnerId) => {
  const order = await Order.findById(orderId);
  const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  if (!deliveryPartner.isAvailable) {
    throw new ApiError(400, "Delivery partner is not available");
  }

  // Assign delivery partner
  order.deliveryPartner = deliveryPartnerId;
  order.status = "out_for_delivery";

  // Initialize delivery location with partner's current location
  order.deliveryLocation = {
    latitude: deliveryPartner.currentLocation.latitude,
    longitude: deliveryPartner.currentLocation.longitude,
    updatedAt: new Date(),
  };

  // Add to status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    status: "out_for_delivery",
    timestamp: new Date(),
    updatedBy: `delivery_partner:${deliveryPartnerId}`,
  });

  await order.save();

  // Update delivery partner
  deliveryPartner.activeOrders.push(orderId);
  deliveryPartner.isAvailable = false;
  await deliveryPartner.save();

  // Cache in Redis
  await redisService.cacheDeliveryLocation(orderId, {
    latitude: deliveryPartner.currentLocation.latitude,
    longitude: deliveryPartner.currentLocation.longitude,
    deliveryPartnerId,
  });

  await redisService.cacheActiveOrder(orderId, {
    status: "out_for_delivery",
    deliveryPartnerId,
  });

  // Emit real-time event
  try {
    const io = getIO();
    io.to(`order:${orderId}`).emit("order:pickedUp", {
      orderId: order._id,
      deliveryPartner: {
        id: deliveryPartner._id,
        name: deliveryPartner.name,
        phone: deliveryPartner.phone,
        profilePhoto: deliveryPartner.profilePhoto,
        vehicleType: deliveryPartner.vehicleType,
        vehicleNumber: deliveryPartner.vehicleNumber,
        rating: deliveryPartner.rating,
      },
      estimatedDeliveryTime: order.estimatedDeliveryTime,
    });
  } catch (error) {
    console.error("Socket emit error:", error);
  }

  return order;
};

/**
 * UPDATE DELIVERY LOCATION
 * -------------------------
 * Update delivery partner's current location (called every 5-10 seconds)
 */
const updateDeliveryLocation = async (orderId, latitude, longitude) => {
  const order = await Order.findById(orderId).populate("deliveryPartner");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!order.deliveryPartner) {
    throw new ApiError(400, "No delivery partner assigned");
  }

  // Update order's delivery location
  order.deliveryLocation = {
    latitude,
    longitude,
    updatedAt: new Date(),
  };

  await order.save();

  // Update delivery partner's current location
  const deliveryPartner = await DeliveryPartner.findById(order.deliveryPartner._id);
  deliveryPartner.currentLocation = {
    latitude,
    longitude,
    updatedAt: new Date(),
  };
  await deliveryPartner.save();

  // Cache in Redis for fast access (PRIMARY STORAGE for live tracking)
  await redisService.cacheDeliveryLocation(orderId, {
    latitude,
    longitude,
    deliveryPartnerId: order.deliveryPartner._id,
  });

  // Emit real-time location update
  try {
    const io = getIO();
    io.to(`order:${orderId}`).emit("delivery:locationUpdate", {
      orderId: order._id,
      location: {
        latitude,
        longitude,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Socket emit error:", error);
  }

  return {
    orderId: order._id,
    location: order.deliveryLocation,
  };
};

/**
 * MARK ORDER AS DELIVERED
 * ------------------------
 * Complete the delivery process
 */
const markAsDelivered = async (orderId, deliveryPartnerId) => {
  const order = await Order.findById(orderId);
  const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = "delivered";

  // Add to status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    status: "delivered",
    timestamp: new Date(),
    updatedBy: `delivery_partner:${deliveryPartnerId}`,
  });

  await order.save();

  // Update delivery partner
  if (deliveryPartner) {
    deliveryPartner.activeOrders = deliveryPartner.activeOrders.filter(
      (id) => id.toString() !== orderId.toString()
    );
    deliveryPartner.isAvailable = true;
    deliveryPartner.totalDeliveries += 1;
    await deliveryPartner.save();
  }

  // Remove from Redis cache
  await redisService.deleteCachedLocation(orderId);
  await redisService.removeActiveOrder(orderId);

  // Emit real-time event
  try {
    const io = getIO();
    io.to(`order:${orderId}`).emit("order:delivered", {
      orderId: order._id,
      deliveredAt: new Date(),
    });
  } catch (error) {
    console.error("Socket emit error:", error);
  }

  return order;
};

module.exports = {
  updateOrderStatus,
  getOrderTracking,
  assignDeliveryPartner,
  updateDeliveryLocation,
  markAsDelivered,
};
