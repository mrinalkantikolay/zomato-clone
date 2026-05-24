const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const errorHandler = require("./middlewares/error.middleware");
const requestIdMiddleware = require("./middlewares/requestId.middleware");

const app = express();

/* =========================================================
   TRUST PROXY (RENDER / RAILWAY / PRODUCTION FIX)
========================================================= */
app.set("trust proxy", 1);

/* =========================================================
   CORS CONFIG (CRITICAL FOR COOKIES + REFRESH TOKEN)
========================================================= */
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://foodie-hub-hq3j.onrender.com",
  credentials: true, // MUST BE TRUE for cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));

/* =========================================================
   BODY PARSING MIDDLEWARE
========================================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // REQUIRED for refresh token cookie access

/* =========================================================
   SECURITY MIDDLEWARE
========================================================= */
app.use(helmet());

/* =========================================================
   REQUEST TRACKING + LOGGING
========================================================= */
app.use(requestIdMiddleware);
app.use(morgan("dev"));

/* =========================================================
   RATE LIMITER (IN-MEMORY DEFAULT)
   (Redis upgrade happens in server.js)
========================================================= */
const limiterOptions = {
  windowMs: 2 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
};

const limiter = rateLimit(limiterOptions);
app.use(limiter);

/**
 * Upgrade rate limiter to Redis (called from server.js)
 */
app.upgradeRateLimiter = () => {
  try {
    const { RedisStore } = require("rate-limit-redis");
    const { redisClient } = require("./config/redis");

    if (redisClient && redisClient.isReady) {
      limiterOptions.store = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      });

      // remove old limiter
      app._router.stack = app._router.stack.filter(
        (layer) => layer.handle !== limiter
      );

      app.use(rateLimit(limiterOptions));

      console.log("✅ Rate limiter upgraded to Redis store");
    }
  } catch (error) {
    console.warn(
      "⚠️ Rate limiter Redis upgrade failed, using memory:",
      error.message
    );
  }
};

/* =========================================================
   API DOCUMENTATION (SWAGGER)
========================================================= */
const { swaggerUi, swaggerDocs } = require("./config/swagger");

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Food Delivery API Documentation",
  })
);

/* =========================================================
   ROUTES (VERSIONED API)
========================================================= */

// AUTH
const authRoutes = require("./routes/auth.routes");
app.use("/api/v1/auth", authRoutes);

// RESTAURANTS
const restaurantRoutes = require("./routes/restaurant.routes");
app.use("/api/v1/restaurants", restaurantRoutes);

// MENU
const menuRoutes = require("./routes/menu.routes");
app.use("/api/v1/menu", menuRoutes);

// CART
const cartRoutes = require("./routes/cart.routes");
app.use("/api/v1/cart", cartRoutes);

// ORDERS
const orderRoutes = require("./routes/order.routes");
app.use("/api/v1/orders", orderRoutes);

// TRACKING (FIXED DUPLICATE PREFIX ISSUE)
const orderTrackingRoutes = require("./routes/orderTracking.routes");
app.use("/api/v1/tracking", orderTrackingRoutes);

// PAYMENTS
const paymentRoutes = require("./routes/payment.routes");
app.use("/api/v1/payments", paymentRoutes);

// ADMIN
const adminRoutes = require("./routes/admin.routes");
app.use("/api/v1/admin", adminRoutes);

// SUPER ADMIN
const superadminRoutes = require("./routes/superadmin.routes");
app.use("/api/v1/superadmin", superadminRoutes);

// OWNER
const ownerRoutes = require("./routes/owner.routes");
app.use("/api/v1/owner", ownerRoutes);

// UPLOAD
const uploadRoutes = require("./routes/upload.routes");
app.use("/api/v1/upload", uploadRoutes);

// DELIVERY PARTNERS
const deliveryPartnerRoutes = require("./routes/deliveryPartner.routes");
app.use("/api/v1/delivery-partners", deliveryPartnerRoutes);

/* =========================================================
   HEALTH CHECK
========================================================= */
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   404 HANDLER
========================================================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */
app.use(errorHandler);

module.exports = app;
