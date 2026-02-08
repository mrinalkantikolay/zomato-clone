const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const DeliveryPartner = require("../models/deliveryPartner.model");

/**
 * SOCKET AUTHENTICATION MIDDLEWARE
 * ---------------------------------
 * Authenticates socket connections based on user role
 */

const socketAuthMiddleware = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Invalid token"));
    }

    // Get role from token or query
    const role = socket.handshake.auth.role || socket.handshake.query.role || "user";

    // Attach user info to socket
    socket.userId = decoded.id || decoded._id;
    socket.role = role;

    // Role-based validation
    if (role === "delivery_partner") {
      // Verify delivery partner exists
      const deliveryPartner = await DeliveryPartner.findById(socket.userId);

      if (!deliveryPartner) {
        return next(new Error("Delivery partner not found"));
      }

      socket.deliveryPartnerId = deliveryPartner._id;
      socket.deliveryPartnerName = deliveryPartner.name;

      console.log(` Delivery partner connected: ${deliveryPartner.name} (${socket.id})`);
    } else if (role === "user" || role === "customer") {
      // Verify user exists
      const user = await User.findById(socket.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userName = user.name;

      console.log(`👤 User connected: ${user.name} (${socket.id})`);
    } else if (role === "admin") {
      // Admin access - verify user exists and is admin
      const user = await User.findById(socket.userId);
      if (!user || user.role !== "admin") {
        return next(new Error("Admin not found or unauthorized"));
      }
      console.log(` Admin connected: ${user.name} (${socket.id})`);
    } else if (role === "restaurant") {
      // Restaurant access - set restaurantId for order validation
      // Note: restaurantId should be passed in handshake or stored in user profile
      const restaurantId = socket.handshake.auth.restaurantId || socket.handshake.query.restaurantId;
      if (!restaurantId) {
        return next(new Error("Restaurant ID required for restaurant role"));
      }
      socket.restaurantId = parseInt(restaurantId, 10);
      console.log(` Restaurant connected: ID ${restaurantId} (${socket.id})`);
    } else {
      return next(new Error("Invalid role"));
    }

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }

    return next(new Error("Authentication failed"));
  }
};

/**
 * ROLE-BASED SOCKET AUTHORIZATION
 * --------------------------------
 * Check if socket has permission for specific actions
 */
const authorizeSocketAction = (allowedRoles) => {
  return (socket, next) => {
    if (!socket.role) {
      return next(new Error("No role assigned"));
    }

    if (!allowedRoles.includes(socket.role)) {
      return next(new Error(`Unauthorized: ${socket.role} cannot perform this action`));
    }

    next();
  };
};

/**
 * VALIDATE ORDER ACCESS
 * ---------------------
 * Check if user has access to specific order
 */
const validateOrderAccess = async (socket, orderId) => {
  const Order = require("../models/order.model");

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return { authorized: false, reason: "Order not found" };
    }

    // Admin has access to all orders
    if (socket.role === "admin") {
      return { authorized: true };
    }

    // User can only access their own orders
    if (socket.role === "user" || socket.role === "customer") {
      if (order.userId.toString() === socket.userId.toString()) {
        return { authorized: true };
      }
      return { authorized: false, reason: "Not your order" };
    }

    // Delivery partner can access assigned orders
    if (socket.role === "delivery_partner") {
      if (order.deliveryPartner && order.deliveryPartner.toString() === socket.deliveryPartnerId.toString()) {
        return { authorized: true };
      }
      return { authorized: false, reason: "Not assigned to you" };
    }

    // Restaurant can access their orders
    if (socket.role === "restaurant") {
      if (order.restaurantId === socket.restaurantId) {
        return { authorized: true };
      }
      return { authorized: false, reason: "Not your restaurant's order" };
    }

    return { authorized: false, reason: "Unauthorized role" };
  } catch (error) {
    console.error("Order access validation error:", error);
    return { authorized: false, reason: "Validation error" };
  }
};

module.exports = {
  socketAuthMiddleware,
  authorizeSocketAction,
  validateOrderAccess,
};
