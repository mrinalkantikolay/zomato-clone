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
   TRUST PROXY (RENDER / PRODUCTION COOKIE FIX)
========================================================= */
app.set("trust proxy", 1);

/* =========================================================
   CORS CONFIG (CRITICAL FOR COOKIES + REFRESH TOKEN)
========================================================= */
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://foodie-hub-hq3j.onrender.com",
  credentials: true, // MUST for cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/* =========================================================
   BODY PARSER + COOKIE PARSER
========================================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // REQUIRED for req.cookies

/* =========================================================
   SECURITY HEADERS
========================================================= */
app.use(helmet());

/* =========================================================
   REQUEST LOGGING + ID
========================================================= */
app.use(requestIdMiddleware);
app.use(morgan("dev"));

/* =========================================================
   RATE LIMITER (DEFAULT MEMORY STORE)
========================================================= */
const limiterOptions = {
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
};

const limiter = rateLimit(limiterOptions);
app.use(limiter);

/* =========================================================
   OPTIONAL: REDIS RATE LIMITER UPGRADE
========================================================= */
app.upgradeRateLimiter = () => {
  try {
    const { RedisStore } = require("rate-limit-redis");
    const { redisClient } = require("./config/redis");

    if (redisClient && redisClient.isReady) {
      limiterOptions.store = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      });

      console.log("✅ Rate limiter upgraded to Redis store");
    }
  } catch (error) {
    console.warn(
      "⚠️ Redis rate limiter failed, using memory:",
      error.message
    );
  }
};

/* =========================================================
   ROUTES (VERSIONED API)
========================================================= */

// AUTH
app.use("/api/v1/auth", require("./routes/auth.routes"));

// RESTAURANTS
app.use("/api/v1/restaurants", require("./routes/restaurant.routes"));

// MENU
app.use("/api/v1/menu", require("./routes/menu.routes"));

// CART
app.use("/api/v1/cart", require("./routes/cart.routes"));

// ORDERS
app.use("/api/v1/orders", require("./routes/order.routes"));

// TRACKING
app.use("/api/v1/tracking", require("./routes/orderTracking.routes"));

// PAYMENTS
app.use("/api/v1/payments", require("./routes/payment.routes"));

// ADMIN
app.use("/api/v1/admin", require("./routes/admin.routes"));

// SUPER ADMIN
app.use("/api/v1/superadmin", require("./routes/superadmin.routes"));

// OWNER
app.use("/api/v1/owner", require("./routes/owner.routes"));

// UPLOAD
app.use("/api/v1/upload", require("./routes/upload.routes"));

// DELIVERY PARTNERS
app.use("/api/v1/delivery-partners", require("./routes/deliveryPartner.routes"));

/* =========================================================
   HEALTH CHECK
========================================================= */
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is healthy",
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
