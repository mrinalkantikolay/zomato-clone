const { createClient } = require("redis");

//Redis config

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  socket: {
    //Reconnect stratergy (important for cloud Redis)
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis connect failed after 10 attempts");
        return new Error("Redis reconnect failed");
      }
      return Math.min(retries * 10, 3000);
    },
  },
});

//Redis Event Listeners

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
  console.error("Redis error:", err);
});

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
})();

// Graceful shutdown

const shutdownRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("Redis connection closed gracefully");
    }
  } catch (error) {
    console.error("Error closing Redis:", error);
  }
};

process.on("SIGINT", shutdownRedis);
process.on("SIGTERM", shutdownRedis);

module.exports = redisClient;