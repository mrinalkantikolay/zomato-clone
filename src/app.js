const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");

const errorHandler = require("./middlewares/error.middleware");
const requestIdMiddleware = require("./middlewares/requestId.middleware");

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies for refresh token

// Request ID (for tracing and audit logs)
app.use(requestIdMiddleware);

// 🔐 XSS Protection
app.use(xss());

// Logging
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 100, // 100 requests per IP
});
app.use(limiter);

// Security Headers
app.use(helmet());

/* =========================
   API DOCUMENTATION
========================= */

const { swaggerUi, swaggerDocs } = require("./config/swagger");
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Zomato API Documentation",
  })
);

/* =========================
   API ROUTES (VERSIONED)
========================= */

// Auth Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/v1/auth", authRoutes);

// Restaurant Routes
const restaurantRoutes = require("./routes/restaurant.routes");
app.use("/api/v1/restaurants", restaurantRoutes);

// Menu Routes
const menuRoutes = require("./routes/menu.routes");
app.use("/api/v1/menu", menuRoutes);

// Cart Routes
const cartRoutes = require("./routes/cart.routes");
app.use("/api/v1/cart", cartRoutes);

// Order Routes
const orderRoutes = require("./routes/order.routes");
app.use("/api/v1/orders", orderRoutes);

// Order Tracking Routes
const orderTrackingRoutes = require("./routes/orderTracking.routes");
app.use("/api/v1/orders", orderTrackingRoutes);

// Payment Routes
const paymentRoutes = require("./routes/payment.routes");
app.use("/api/v1/payments", paymentRoutes);

// Admin Routes
const adminRoutes = require("./routes/admin.routes");
app.use("/api/v1/admin", adminRoutes);

// Upload Routes
const uploadRoutes = require("./routes/upload.routes");
app.use("/api/v1/upload", uploadRoutes);

// Delivery Partner Routes (Simulation)
const deliveryPartnerRoutes = require("./routes/deliveryPartner.routes");
app.use("/api/v1/delivery-partners", deliveryPartnerRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

module.exports = app;
