/**
 * COOKIE CONFIGURATION
 * --------------------
 * Centralized cookie settings for the entire app.
 * Used by auth controller for refresh token cookies.
 *
 * Security features:
 * - httpOnly: true        → Prevents XSS (JavaScript cannot read the cookie)
 * - secure: true (prod)   → Cookie only sent over HTTPS
 * - sameSite: "strict"    → Prevents CSRF (cookie not sent on cross-site requests)
 * - path: "/api/v1/auth"  → Cookie only sent to auth endpoints (minimizes exposure)
 * - maxAge: 7 days        → Matches refresh token JWT expiry
 * - signed: false         → We verify integrity via JWT signature, not cookie signing
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Options for SETTING the refresh token cookie
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                      // XSS protection — JS cannot read
  secure: isProduction,                // HTTPS-only in production
  sameSite: isProduction ? "strict" : "lax",  // CSRF protection (lax in dev for easier testing)
  path: "/api/v1/auth",               // Only sent to auth endpoints
  maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days in milliseconds
};

/**
 * Options for CLEARING the refresh token cookie
 * Must match the set options (path, domain, sameSite, secure, httpOnly)
 * for the browser to actually delete the cookie
 */
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/api/v1/auth",
};

const COOKIE_NAME = "refreshToken";

module.exports = {
  REFRESH_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
  COOKIE_NAME,
};
