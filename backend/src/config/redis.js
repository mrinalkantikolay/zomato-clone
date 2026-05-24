const { createClient } = require("redis");

// Redis config
const MAX_RETRIES = Number(process.env.REDIS_CONNECT_RETRIES || 5);
const RETRY_DELAY_MS = Number(process.env.REDIS_CONNECT_RETRY_DELAY_MS || 2000);
const BACKGROUND_RETRY_DELAY_MS = Number(
  process.env.REDIS_BACKGROUND_RETRY_DELAY_MS || 30000
);

let connectPromise = null;
let backgroundRetryTimer = null;

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
  if (redisClient.isReady) {
    return true;
  }

  if (!connectPromise) {
    connectPromise = (async () => {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (!redisClient.isOpen) {
            await redisClient.connect();
          }

          if (redisClient.isReady) {
            return true;
          }
        } catch (error) {
          console.error(
            `Redis connection failed (attempt ${attempt}/${MAX_RETRIES}):`,
            error.message
          );
        }

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }

      console.error("Redis unavailable after retry attempts; continuing without Redis");
      return false;
    })().finally(() => {
      connectPromise = null;
    });
  }

  return connectPromise;
};

const stopRedisReconnectLoop = () => {
  if (backgroundRetryTimer) {
    clearTimeout(backgroundRetryTimer);
    backgroundRetryTimer = null;
  }
};

const startRedisReconnectLoop = (onConnected) => {
  if (redisClient.isReady || backgroundRetryTimer) {
    return;
  }

  const retry = async () => {
    backgroundRetryTimer = null;

    if (redisClient.isReady) {
      if (onConnected) onConnected();
      return;
    }

    const connected = await connectRedis();
    if (connected) {
      if (onConnected) onConnected();
      return;
    }

    backgroundRetryTimer = setTimeout(retry, BACKGROUND_RETRY_DELAY_MS);
  };

  backgroundRetryTimer = setTimeout(retry, BACKGROUND_RETRY_DELAY_MS);
};

/**
 * Graceful shutdown (called from centralized handler in server.js)
 */
const shutdownRedis = async () => {
  try {
    stopRedisReconnectLoop();

    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("Redis connection closed gracefully");
    }
  } catch (error) {
    console.error("Error closing Redis:", error.message);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  startRedisReconnectLoop,
  shutdownRedis,
};
