const redisClient = require("../config/redis");

/**
 * CACHE MIDDLEWARE
 * ----------------
 * Generic Redis cache for GET APIs
 *
 * Usage:
 * router.get("/restaurants", cache(300), controller.getAllRestaurants);
 */
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Cache ONLY GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip cache if Redis is not connected
    if (!redisClient.isOpen) {
      return next();
    }

    try {
      // Unique cache key (URL + query params)
      const cacheKey = `cache:${req.originalUrl}`;

      // 1️⃣ Check Redis
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(" Cache HIT:", cacheKey);
        return res.status(200).json(JSON.parse(cachedData));
      }

      console.log(" Cache MISS:", cacheKey);

      // 2️⃣ Override res.json to store response in Redis
      const originalJson = res.json.bind(res);

      res.json = (data) => {
        // Cache only successful responses
        if (res.statusCode === 200) {
          redisClient.setEx(
            cacheKey,
            duration,
            JSON.stringify(data)
          ).catch((err) =>
            console.error("Redis cache set error:", err)
          );
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next(); // Fail-safe: continue without cache
    }
  };
};

/**
 * CLEAR CACHE BY PATTERN
 * ---------------------
 * Used after CREATE / UPDATE / DELETE
 */
const clearCacheByPattern = async (pattern) => {
  if (!redisClient.isOpen) return;

  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

/**
 * RESOURCE-SPECIFIC CACHE CLEAR HELPERS
 */
const clearRestaurantCache = async () => {
  await clearCacheByPattern("cache:/api/restaurants*");
};

const clearMenuCache = async (restaurantId) => {
  if (restaurantId) {
    await clearCacheByPattern(
      `cache:/api/menu/restaurant/${restaurantId}*`
    );
  } else {
    await clearCacheByPattern("cache:/api/menu*");
  }
};

module.exports = {
  cache,
  clearRestaurantCache,
  clearMenuCache,
};