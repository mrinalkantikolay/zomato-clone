const DeliveryPartner = require("../models/deliveryPartner.model");
const Order = require("../models/order.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const redisService = require("../services/redis.service");
const { getIO } = require("../config/socket");

/**
 * DELIVERY PARTNER SIMULATION ENDPOINTS
 * --------------------------------------
 * Simulate delivery partner app actions
 */

/**
 * CREATE DELIVERY PARTNER (FOR TESTING)
 * --------------------------------------
 * Create a dummy delivery partner for simulation
 */
const createDeliveryPartner = asyncHandler(async (req, res) => {
  const { name, phone, email, vehicleType, vehicleNumber } = req.body;

  const existingPartner = await DeliveryPartner.findOne({
    $or: [{ phone }, { email }],
  });

  if (existingPartner) {
    throw new ApiError(400, "Delivery partner already exists with this phone/email");
  }

  const deliveryPartner = await DeliveryPartner.create({
    name,
    phone,
    email,
    vehicleType: vehicleType || "bike",
    vehicleNumber,
    currentLocation: {
      latitude: 28.6139 + Math.random() * 0.1, // Random location in Delhi area
      longitude: 77.2090 + Math.random() * 0.1,
      updatedAt: new Date(),
    },
    isAvailable: true,
  });

  res.status(201).json({
    success: true,
    message: "Delivery partner created successfully",
    data: deliveryPartner,
  });
});

/**
 * GET ALL DELIVERY PARTNERS
 * --------------------------
 * List all delivery partners (for admin)
 */
const getAllDeliveryPartners = asyncHandler(async (req, res) => {
  const { isAvailable } = req.query;

  const filter = {};
  if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable === "true";
  }

  const deliveryPartners = await DeliveryPartner.find(filter).populate("activeOrders");

  res.status(200).json({
    success: true,
    count: deliveryPartners.length,
    data: deliveryPartners,
  });
});

/**
 * GET DELIVERY PARTNER DETAILS
 * -----------------------------
 * Get specific delivery partner info
 */
const getDeliveryPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  const deliveryPartner = await DeliveryPartner.findById(partnerId).populate("activeOrders");

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  res.status(200).json({
    success: true,
    data: deliveryPartner,
  });
});

/**
 * SIMULATE: ACCEPT ORDER
 * -----------------------
 * Delivery partner accepts an order assignment
 */
const acceptOrder = asyncHandler(async (req, res) => {
  const { partnerId, orderId } = req.body;

  const deliveryPartner = await DeliveryPartner.findById(partnerId);
  const order = await Order.findById(orderId);

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!deliveryPartner.isAvailable) {
    throw new ApiError(400, "Delivery partner is not available");
  }

  // Assign order
  order.deliveryPartner = partnerId;
  order.status = "out_for_delivery";
  order.deliveryLocation = {
    latitude: deliveryPartner.currentLocation.latitude,
    longitude: deliveryPartner.currentLocation.longitude,
    updatedAt: new Date(),
  };

  if (!order.statusHistory) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    status: "out_for_delivery",
    timestamp: new Date(),
    updatedBy: `delivery_partner:${partnerId}`,
  });

  await order.save();

  // Update delivery partner
  deliveryPartner.activeOrders.push(orderId);
  deliveryPartner.isAvailable = false;
  await deliveryPartner.save();

  // Cache in Redis
  await redisService.cacheDeliveryPartnerStatus(partnerId, {
    isActive: true,
    currentOrderId: orderId,
  });

  await redisService.cacheActiveOrder(orderId, {
    status: "out_for_delivery",
    deliveryPartnerId: partnerId,
  });

  // Emit socket event
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

  res.status(200).json({
    success: true,
    message: "Order accepted successfully",
    data: {
      orderId: order._id,
      deliveryPartner: deliveryPartner,
    },
  });
});

/**
 * SIMULATE: UPDATE LOCATION
 * --------------------------
 * Delivery partner updates their GPS location
 */
const updateLocation = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;
  const { latitude, longitude, orderId } = req.body;

  const deliveryPartner = await DeliveryPartner.findById(partnerId);

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  // Update delivery partner location
  deliveryPartner.currentLocation = {
    latitude,
    longitude,
    updatedAt: new Date(),
  };
  await deliveryPartner.save();

  // If orderId provided, update order's delivery location
  if (orderId) {
    const order = await Order.findById(orderId);

    if (order) {
      order.deliveryLocation = {
        latitude,
        longitude,
        updatedAt: new Date(),
      };
      await order.save();

      // Cache in Redis for fast access
      await redisService.cacheDeliveryLocation(orderId, {
        latitude,
        longitude,
        deliveryPartnerId: partnerId,
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
    }
  }

  res.status(200).json({
    success: true,
    message: "Location updated successfully",
    data: {
      partnerId,
      location: {
        latitude,
        longitude,
      },
      timestamp: new Date(),
    },
  });
});

/**
 * SIMULATE: COMPLETE DELIVERY
 * ----------------------------
 * Mark order as delivered
 */
const completeDelivery = asyncHandler(async (req, res) => {
  const { partnerId, orderId } = req.body;

  const deliveryPartner = await DeliveryPartner.findById(partnerId);
  const order = await Order.findById(orderId);

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Update order status
  order.status = "delivered";

  if (!order.statusHistory) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    status: "delivered",
    timestamp: new Date(),
    updatedBy: `delivery_partner:${partnerId}`,
  });

  await order.save();

  // Update delivery partner
  deliveryPartner.activeOrders = deliveryPartner.activeOrders.filter(
    (id) => id.toString() !== orderId.toString()
  );
  deliveryPartner.isAvailable = true;
  deliveryPartner.totalDeliveries += 1;
  await deliveryPartner.save();

  // Remove from Redis cache
  await redisService.deleteCachedLocation(orderId);
  await redisService.removeActiveOrder(orderId);
  await redisService.cacheDeliveryPartnerStatus(partnerId, {
    isActive: false,
    currentOrderId: null,
  });

  // Emit socket event
  try {
    const io = getIO();
    io.to(`order:${orderId}`).emit("order:delivered", {
      orderId: order._id,
      deliveredAt: new Date(),
    });
  } catch (error) {
    console.error("Socket emit error:", error);
  }

  res.status(200).json({
    success: true,
    message: "Delivery completed successfully",
    data: {
      orderId: order._id,
      status: order.status,
      deliveryPartner: {
        id: deliveryPartner._id,
        name: deliveryPartner.name,
        totalDeliveries: deliveryPartner.totalDeliveries,
      },
    },
  });
});

/**
 * SIMULATE: AUTO LOCATION UPDATE
 * -------------------------------
 * Simulate automatic location updates (for testing)
 */
const simulateLocationUpdates = asyncHandler(async (req, res) => {
  const { partnerId, orderId, duration = 60 } = req.body; // duration in seconds

  const deliveryPartner = await DeliveryPartner.findById(partnerId);
  const order = await Order.findById(orderId);

  if (!deliveryPartner || !order) {
    throw new ApiError(404, "Delivery partner or order not found");
  }

  // Start simulation (in real app, this would be handled by delivery partner's mobile app)
  res.status(200).json({
    success: true,
    message: `Location simulation started for ${duration} seconds`,
    data: {
      partnerId,
      orderId,
      duration,
      note: "Use POST /api/delivery-partners/:partnerId/location to manually update location",
    },
  });

  // Simulate location updates every 5 seconds
  let elapsed = 0;
  const interval = setInterval(async () => {
    elapsed += 5;

    if (elapsed > duration) {
      clearInterval(interval);
      console.log(`✅ Location simulation completed for order ${orderId}`);
      return;
    }

    // Generate random movement (simulate delivery partner moving)
    const currentLat = deliveryPartner.currentLocation.latitude;
    const currentLng = deliveryPartner.currentLocation.longitude;

    const newLat = currentLat + (Math.random() - 0.5) * 0.001; // Small random movement
    const newLng = currentLng + (Math.random() - 0.5) * 0.001;

    // Update location
    deliveryPartner.currentLocation = {
      latitude: newLat,
      longitude: newLng,
      updatedAt: new Date(),
    };
    await deliveryPartner.save();

    order.deliveryLocation = {
      latitude: newLat,
      longitude: newLng,
      updatedAt: new Date(),
    };
    await order.save();

    // Cache in Redis
    await redisService.cacheDeliveryLocation(orderId, {
      latitude: newLat,
      longitude: newLng,
      deliveryPartnerId: partnerId,
    });

    // Emit socket event
    try {
      const io = getIO();
      io.to(`order:${orderId}`).emit("delivery:locationUpdate", {
        orderId: order._id,
        location: {
          latitude: newLat,
          longitude: newLng,
        },
        timestamp: new Date(),
      });

      console.log(`📍 Location updated: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
    } catch (error) {
      console.error("Socket emit error:", error);
    }
  }, 5000); // Update every 5 seconds
});

module.exports = {
  createDeliveryPartner,
  getAllDeliveryPartners,
  getDeliveryPartner,
  acceptOrder,
  updateLocation,
  completeDelivery,
  simulateLocationUpdates,
};
