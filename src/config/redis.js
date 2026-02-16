const { createClient } = require("redis");

// Redis config

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  socket: {
    // Reconnect strategy (important for cloud Redis)
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis connect failed after 10 attempts");
        return new Error("Redis reconnect failed");
      }
      return Math.min(retries * 100, 5000);
    },
    connectTimeout: 10000,
  },
});

// Redis Event Listeners

redisClient.on("connect", () => {
  console.log("Redis client connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis connected and Ready");
});

redisClient.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

/**
 * Connect to Redis (MUST be awaited before server starts)
 * No more IIFE — connection is explicit and awaited in server.js
 */
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    // Don't exit — app can work without Redis (degraded mode)
  }
};

/**
 * Graceful shutdown (called from centralized handler in server.js)
 */
const shutdownRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("Redis connection closed gracefully");
    }
  } catch (error) {
    console.error("Error closing Redis:", error.message);
  }
};

module.exports = { redisClient, connectRedis, shutdownRedis };