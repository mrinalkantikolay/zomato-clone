// ======================
// HANDLE SYNC ERRORS FIRST
// ======================
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION ", err);
  process.exit(1);
});

// ======================
// LOAD ENV VARIABLES FIRST
// ======================
require("dotenv").config();

const http = require("http");
const https = require("https");
const fs = require("fs");
const app = require("./app");

const { sequelize } = require("./config/mysql");

// ======================
// DATABASE CONNECTIONS
// ======================
const connectMongoDB = require("./config/mongo");
const { connectMySQL } = require("./config/mysql");
const { connectRedis, shutdownRedis } = require("./config/redis");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 4005;
const NODE_ENV = process.env.NODE_ENV || "development";

let server;

const startServer = async () => {
  try {
    // Connect ALL services before starting server (no race conditions)
    await connectRedis();
    await connectMongoDB();
    await connectMySQL();

    // Upgrade rate limiter to Redis store (after Redis is connected)
    app.upgradeRateLimiter();

    // Sync MySQL tables only in development (dangerous in production)
    if (NODE_ENV === "development") {
      await sequelize.sync();
      console.log(" MySQL tables synced (dev mode)");
    }

    // ======================
    // CREATE SERVER (HTTP or HTTPS)
    // ======================
    const SSL_KEY = process.env.SSL_KEY_PATH;
    const SSL_CERT = process.env.SSL_CERT_PATH;

    if (SSL_KEY && SSL_CERT && fs.existsSync(SSL_KEY) && fs.existsSync(SSL_CERT)) {
      // HTTPS mode (production with SSL certificates)
      const sslOptions = {
        key: fs.readFileSync(SSL_KEY),
        cert: fs.readFileSync(SSL_CERT),
      };
      server = https.createServer(sslOptions, app);
      console.log(" HTTPS enabled with SSL certificates");
    } else {
      // HTTP mode (development or behind reverse proxy)
      server = http.createServer(app);
      if (NODE_ENV === "production") {
        console.warn(" WARNING: Running HTTP in production. Use a reverse proxy (Nginx/Cloudflare) for HTTPS.");
      }
    }

    // Initialize Socket.IO for real-time tracking
    const { initializeSocket } = require("./config/socket");
    initializeSocket(server);
    console.log(" Socket.IO initialized");

    // Start server
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${NODE_ENV}`);
      console.log(" MongoDB + MySQL + Redis connected");
      console.log(" Real-time tracking enabled");
    });

    // ======================
    // HANDLE ASYNC ERRORS
    // ======================
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION ", err);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

// ======================
// CENTRALIZED GRACEFUL SHUTDOWN
// ======================
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    // 1. Stop accepting new connections
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log(" HTTP server closed");
    }

    // 2. Close Redis
    await shutdownRedis();

    // 3. Close MongoDB
    await mongoose.connection.close();
    console.log(" MongoDB connection closed");

    // 4. Close MySQL
    await sequelize.close();
    console.log(" MySQL connection closed");

    console.log(" Graceful shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error.message);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();