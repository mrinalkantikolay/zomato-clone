const mongoose = require("mongoose");

/**
 * AuditLog Model
 * 
 * Purpose: Track security-critical actions for compliance and security monitoring
 * Storage: MongoDB (queryable, indexed)
 * Retention: Recommend TTL index or archival after 90 days
 */

const auditLogSchema = new mongoose.Schema(
  {
    // User context
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Fast queries by user
    },

    role: {
      type: String,
      enum: ["user", "admin", "restaurant", "delivery_partner"],
      required: true,
    },

    // Action details
    action: {
      type: String,
      required: true,
      index: true, // Fast queries by action type
      enum: [
        // Auth actions
        "USER_LOGIN",
        "USER_LOGOUT",
        "USER_SIGNUP",
        "TOKEN_REFRESH",

        // Admin actions
        "RESTAURANT_CREATE",
        "RESTAURANT_UPDATE",
        "RESTAURANT_DELETE",
        "MENU_CREATE",
        "MENU_UPDATE",
        "MENU_DELETE",

        // Order actions
        "ORDER_STATUS_UPDATE",
        "ORDER_ASSIGN_PARTNER",

        // Payment actions
        "PAYMENT_CREATE",
        "PAYMENT_VERIFY",
      ],
    },

    // Resource context (optional - for actions on specific resources)
    resourceType: {
      type: String,
      enum: ["user", "restaurant", "menu", "order", "payment", null],
      default: null,
    },

    resourceId: {
      type: String, // Can be MongoDB ObjectId or MySQL ID
      default: null,
    },

    // Request context
    ipAddress: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
      default: null,
    },

    requestId: {
      type: String,
      required: true,
      index: true, // For tracing requests
    },

    // Additional metadata (flexible JSON for action-specific data)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // For time-based queries
    },
  },
  {
    // Disable updatedAt - audit logs are immutable
    timestamps: false,
  }
);

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, timestamp: -1 }); // User activity timeline
auditLogSchema.index({ action: 1, timestamp: -1 }); // Action-based queries
auditLogSchema.index({ timestamp: -1 }); // Recent activity

// Optional: TTL index to auto-delete logs after 90 days (uncomment if needed)
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model("AuditLog", auditLogSchema);
