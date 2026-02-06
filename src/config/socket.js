const socketIO = require("socket.io");
const { socketAuthMiddleware, validateOrderAccess } = require("../middlewares/socket.auth.middleware");

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id} (Role: ${socket.role})`);

    // Join room for specific order tracking (with authorization check)
    socket.on("join:order", async (orderId) => {
      // Validate if user has access to this order
      const { authorized, reason } = await validateOrderAccess(socket, orderId);

      if (!authorized) {
        socket.emit("error", {
          message: `Cannot join order room: ${reason}`,
          orderId,
        });
        console.log(`❌ ${socket.role} ${socket.id} denied access to order ${orderId}: ${reason}`);
        return;
      }

      socket.join(`order:${orderId}`);
      console.log(`✅ ${socket.role} ${socket.id} joined order room: ${orderId}`);

      // Send confirmation
      socket.emit("joined:order", {
        orderId,
        message: "Successfully joined order tracking",
      });
    });

    // Leave order room
    socket.on("leave:order", (orderId) => {
      socket.leave(`order:${orderId}`);
      console.log(`👋 ${socket.role} ${socket.id} left order room: ${orderId}`);
    });

    // Delivery partner joins their active orders
    socket.on("join:delivery", (deliveryPartnerId) => {
      // Only delivery partners can join delivery rooms
      if (socket.role !== "delivery_partner") {
        socket.emit("error", {
          message: "Only delivery partners can join delivery rooms",
        });
        return;
      }

      // Verify it's their own delivery partner ID
      if (socket.deliveryPartnerId.toString() !== deliveryPartnerId.toString()) {
        socket.emit("error", {
          message: "Cannot join another delivery partner's room",
        });
        return;
      }

      socket.join(`delivery:${deliveryPartnerId}`);
      console.log(`🛵 Delivery partner ${socket.deliveryPartnerName} joined their room`);
    });

    // Handle location updates from delivery partners
    socket.on("update:location", async (data) => {
      if (socket.role !== "delivery_partner") {
        socket.emit("error", {
          message: "Only delivery partners can update location",
        });
        return;
      }

      const { orderId, latitude, longitude } = data;

      // Broadcast location update to order room
      io.to(`order:${orderId}`).emit("delivery:locationUpdate", {
        orderId,
        location: { latitude, longitude },
        timestamp: new Date(),
        deliveryPartner: {
          id: socket.deliveryPartnerId,
          name: socket.deliveryPartnerName,
        },
      });

      console.log(`📍 Location update from ${socket.deliveryPartnerName}: ${latitude}, ${longitude}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id} (${socket.role})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
