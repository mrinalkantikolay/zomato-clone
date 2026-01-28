const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const rateLimit = require("express-rate-limit");

const helmet = require("helmet");

const errorHandler = require("./middlewares/error.middleware");

//Global Middleware

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//Logging

app.use(morgan("dev"));


//Rate Limiter

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
});

app.use(limiter);

/**
 * Security Headers
 */
app.use(helmet());

// Swagger API Documentation
const { swaggerUi, swaggerDocs } = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Zomato API Documentation"
}));

//Auth Routes

const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);

//Restaurant Routes

const restaurantRoutes = require("./routes/restaurant.routes");

app.use("/api/restaurants", restaurantRoutes);

//Menu Routes

const menuRoutes = require("./routes/menu.routes");

app.use("/api/menu", menuRoutes);

//Cart Routes

const cartRoutes = require("./routes/cart.routes");

app.use("/api/cart", cartRoutes);

// Order Routes

const orderRoutes = require("./routes/order.routes");

app.use("/api/orders", orderRoutes);

//Payment Routes

const paymentRoutes = require("./routes/payment.routes");

app.use("/api/payments", paymentRoutes);

//Admin Routes

const adminRoutes = require("./routes/admin.routes");


app.use("/api/admin", adminRoutes);





//Health Check

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is healthy",
    timestamp: new Date().toISOString()
  });
});

//Api Routes PlaceHolder

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});


app.use(errorHandler);

module.exports = app;