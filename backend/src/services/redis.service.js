const { redisClient } = require("../config/redis");

/**
 * REDIS SERVICE FOR ORDER TRACKING
 * ---------------------------------
 * Caches live location data for fast retrieval
 */

/**
 * CACHE DELIVERY LOCATION
 * -----------------------
 * Store delivery partner's location in Redis for real-time access
 * TTL: 5 minutes (auto-expires if not updated)
 */
const cacheDeliveryLocation = async (orderId, locationData) => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      console.warn("Redis not connected, skipping location cache");
      return false;
    }

    const key = `delivery:location:${orderId}`;
    const data = JSON.stringify({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timestamp: new Date().toISOString(),
      deliveryPartnerId: locationData.deliveryPartnerId,
    });

    // Set with 5 minute expiry (300 seconds)
    await redisClient.setEx(key, 300, data);

    console.log(`✅ Cached location for order ${orderId}`);
    return true;
  } catch (error) {
    console.error("Redis cache error:", error);
    return false;
  }
};

/**
 * GET CACHED DELIVERY LOCATION
 * -----------------------------
 * Retrieve live location from Redis cache
 */
const getCachedDeliveryLocation = async (orderId) => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return null;
    }

    const key = `delivery:location:${orderId}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

/**
 * DELETE CACHED LOCATION
 * -----------------------
 * Remove location cache when order is delivered
 */
const deleteCachedLocation = async (orderId) => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return false;
    }

    const key = `delivery:location:${orderId}`;
    await redisClient.del(key);
    console.log(`🗑️ Deleted location cache for order ${orderId}`);
    return true;
  } catch (error) {
    console.error("Redis delete error:", error);
    return false;
  }
};

/**
 * CACHE DELIVERY PARTNER STATUS
 * ------------------------------
 * Track which delivery partners are currently active
 */
const cacheDeliveryPartnerStatus = async (deliveryPartnerId, status) => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return false;
    }

    const key = `delivery:partner:${deliveryPartnerId}`;
    const data = JSON.stringify({
      isActive: status.isActive,
      currentOrderId: status.currentOrderId || null,
      lastUpdated: new Date().toISOString(),
    });

    // Set with 1 hour expiry
    await redisClient.setEx(key, 3600, data);
    return true;
  } catch (error) {
    console.error("Redis cache error:", error);
    return false;
  }
};

/**
 * GET DELIVERY PARTNER STATUS
 * ----------------------------
 * Check if delivery partner is active
 */
const getDeliveryPartnerStatus = async (deliveryPartnerId) => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return null;
    }

    const key = `delivery:partner:${deliveryPartnerId}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

/**
 * CACHE ACTIVE ORDERS LIST
 * -------------------------
 * Store list of all active orders for quick lookup
 */
const cacheActiveOrder = async (orderId, orderData) => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return false;
    }

    const key = `active:orders`;
    const score = Date.now(); // Use timestamp as score for sorting

    // Add to sorted set
    await redisClient.zAdd(key, {
      score,
      value: JSON.stringify({
        orderId,
        status: orderData.status,
        deliveryPartnerId: orderData.deliveryPartnerId,
      }),
    });

    return true;
  } catch (error) {
    console.error("Redis cache error:", error);
    return false;
  }
};

/**
 * REMOVE FROM ACTIVE ORDERS
 * --------------------------
 * Remove order when delivered/cancelled
 */
const removeActiveOrder = async (orderId) => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return false;
    }

    const key = `active:orders`;
    const members = await redisClient.zRange(key, 0, -1);

    for (const member of members) {
      const data = JSON.parse(member);
      if (data.orderId === orderId) {
        await redisClient.zRem(key, member);
        break;
      }
    }

    return true;
  } catch (error) {
    console.error("Redis remove error:", error);
    return false;
  }
};

/**
 * GET ALL ACTIVE ORDERS
 * ----------------------
 * Retrieve all active orders from cache
 */
const getAllActiveOrders = async () => {
  try {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return [];
    }

    const key = `active:orders`;
    const members = await redisClient.zRange(key, 0, -1);

    return members.map(member => JSON.parse(member));
  } catch (error) {
    console.error("Redis get error:", error);
    return [];
  }
};

module.exports = {
  cacheDeliveryLocation,
  getCachedDeliveryLocation,
  deleteCachedLocation,
  cacheDeliveryPartnerStatus,
  getDeliveryPartnerStatus,
  cacheActiveOrder,
  removeActiveOrder,
  getAllActiveOrders,
};
