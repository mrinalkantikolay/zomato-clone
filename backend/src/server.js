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
const {
  connectRedis,
  startRedisReconnectLoop,
  shutdownRedis,
  redisClient,
} = require("./config/redis");

const mongoose = require("mongoose");

const PORT = process.env.PORT || 4005;
const NODE_ENV = process.env.NODE_ENV || "development";

let server;

// Upgrade rate limiter when Redis is ready
redisClient.on("ready", () => {
  app.upgradeRateLimiter();
});

const startServer = async () => {
  try {
    // ======================
    // CONNECT SERVICES
    // ======================
    const redisReady = await connectRedis();

    if (!redisReady) {
      startRedisReconnectLoop(() => app.upgradeRateLimiter());
    }

    await connectMongoDB();
    await connectMySQL();

    // Upgrade rate limiter
    app.upgradeRateLimiter();

    // ======================
    // IMPORTANT FIX (PRODUCTION SAFE)
    // ======================
    // ALWAYS sync tables so "restaurants" etc. exist on Render
    await sequelize.sync({ alter: true });
    console.log(" MySQL tables synced");

    // ======================
    // CREATE SERVER
    // ======================
    const SSL_KEY = process.env.SSL_KEY_PATH;
    const SSL_CERT = process.env.SSL_CERT_PATH;

    if (SSL_KEY && SSL_CERT && fs.existsSync(SSL_KEY) && fs.existsSync(SSL_CERT)) {
      const sslOptions = {
        key: fs.readFileSync(SSL_KEY),
        cert: fs.readFileSync(SSL_CERT),
      };
      server = https.createServer(sslOptions, app);
      console.log(" HTTPS enabled with SSL certificates");
    } else {
      server = http.createServer(app);

      if (NODE_ENV === "production") {
        console.warn(
          " WARNING: Running HTTP in production. Use reverse proxy (Nginx/Cloudflare) for HTTPS."
        );
      }
    }

    // ======================
    // SOCKET.IO
    // ======================
    const { initializeSocket } = require("./config/socket");
    initializeSocket(server);
    console.log(" Socket.IO initialized");

    // ======================
    // START SERVER
    // ======================
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${NODE_ENV}`);
      console.log(
        ` MongoDB + MySQL connected${redisReady ? " + Redis connected" : " (Redis unavailable)"}`
      );
      console.log(" Real-time tracking enabled");
    });

    // ======================
    // ERROR HANDLING
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
// GRACEFUL SHUTDOWN
// ======================
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log(" HTTP server closed");
    }

    await shutdownRedis();

    await mongoose.connection.close();
    console.log(" MongoDB connection closed");

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
