const AuditLog = require("../models/auditLog.model");

/**
 * Audit Logger Utility
 * 
 * Purpose: Async, non-blocking audit logging for security-critical actions
 * 
 * Design principles:
 * 1. NEVER block API responses - fire and forget
 * 2. Log only important actions (not every request)
 * 3. Include context: who, what, when, where
 * 4. Handle errors silently (log to console, don't crash)
 */

class AuditLogger {
  /**
   * Log an audit event
   * 
   * @param {Object} params - Audit log parameters
   * @param {String} params.userId - User ID performing the action
   * @param {String} params.role - User role (user, admin, etc.)
   * @param {String} params.action - Action constant (e.g., USER_LOGIN)
   * @param {String} params.resourceType - Optional resource type
   * @param {String} params.resourceId - Optional resource ID
   * @param {String} params.ipAddress - Client IP address
   * @param {String} params.userAgent - Client user agent
   * @param {String} params.requestId - Unique request ID
   * @param {Object} params.metadata - Optional additional data
   * 
   * @returns {Promise<void>} - Fire and forget (errors logged, not thrown)
   */
  static async log({
    userId,
    role,
    action,
    resourceType = null,
    resourceId = null,
    ipAddress,
    userAgent = null,
    requestId,
    metadata = {},
  }) {
    try {
      // Validate required fields
      if (!userId || !role || !action || !ipAddress || !requestId) {
        console.error("[AuditLogger] Missing required fields:", {
          userId,
          role,
          action,
          ipAddress,
          requestId,
        });
        return;
      }

      // Create audit log entry (async, non-blocking)
      await AuditLog.create({
        userId,
        role,
        action,
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        requestId,
        metadata,
        timestamp: new Date(),
      });

      // Optional: Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[AUDIT] ${action} by ${role} (${userId}) from ${ipAddress}`);
      }
    } catch (error) {
      // CRITICAL: Never throw errors - audit logging should not break API
      console.error("[AuditLogger] Failed to write audit log:", error.message);
      console.error("[AuditLogger] Failed log data:", {
        userId,
        role,
        action,
        resourceType,
        resourceId,
      });
    }
  }

  /**
   * Helper: Extract IP address from request
   * Handles proxies and load balancers
   */
  static getIpAddress(req) {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      "unknown"
    );
  }

  /**
   * Helper: Extract user agent from request
   */
  static getUserAgent(req) {
    return req.headers["user-agent"] || "unknown";
  }

  /**
   * Helper: Build audit log params from request and user
   * Simplifies controller usage
   */
  static buildParams(req, action, options = {}) {
    return {
      userId: req.user?._id || req.user?.id,
      role: req.user?.role || "unknown",
      action,
      resourceType: options.resourceType || null,
      resourceId: options.resourceId || null,
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      requestId: req.requestId || "no-request-id",
      metadata: options.metadata || {},
    };
  }
}

// Action constants (matches AuditLog model enum)
AuditLogger.ACTIONS = {
  // Auth
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_SIGNUP: "USER_SIGNUP",
  TOKEN_REFRESH: "TOKEN_REFRESH",

  // Admin - Restaurant
  RESTAURANT_CREATE: "RESTAURANT_CREATE",
  RESTAURANT_UPDATE: "RESTAURANT_UPDATE",
  RESTAURANT_DELETE: "RESTAURANT_DELETE",

  // Admin - Menu
  MENU_CREATE: "MENU_CREATE",
  MENU_UPDATE: "MENU_UPDATE",
  MENU_DELETE: "MENU_DELETE",

  // Orders
  ORDER_STATUS_UPDATE: "ORDER_STATUS_UPDATE",
  ORDER_ASSIGN_PARTNER: "ORDER_ASSIGN_PARTNER",

  // Payments
  PAYMENT_CREATE: "PAYMENT_CREATE",
  PAYMENT_VERIFY: "PAYMENT_VERIFY",
};

module.exports = AuditLogger;
