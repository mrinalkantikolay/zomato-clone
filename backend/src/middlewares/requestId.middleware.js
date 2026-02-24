const crypto = require("crypto");

/**
 * Request ID Middleware
 * 
 * Purpose: Generate unique ID for each request for tracing and audit logging
 * 
 * Attaches requestId to:
 * - req.requestId (for use in controllers/services)
 * - res.headers['X-Request-Id'] (for client debugging)
 * 
 * Usage in controllers:
 *   const requestId = req.requestId;
 *   auditLogger.log({ requestId, ... });
 */

const requestIdMiddleware = (req, res, next) => {
  // Check if request already has an ID (from load balancer/proxy)
  const existingId = req.headers["x-request-id"];

  // Generate new UUID if not present
  const requestId = existingId || crypto.randomUUID();

  // Attach to request object
  req.requestId = requestId;

  // Send back in response headers for client-side debugging
  res.setHeader("X-Request-Id", requestId);

  next();
};

module.exports = requestIdMiddleware;
