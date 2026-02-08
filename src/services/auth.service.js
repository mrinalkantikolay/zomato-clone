const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const redisClient = require("../config/redis");

/**
 * Auth Service
 * 
 * Implements dual-token authentication:
 * - Access Token: Short-lived (15min), used for API requests
 * - Refresh Token: Long-lived (7d), used to get new access tokens
 * 
 * Security features:
 * - Refresh tokens stored in Redis allowlist (instant revocation)
 * - Unique tokenId per device (granular logout)
 * - Redis TTL auto-expires old tokens
 */

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate short-lived access token (15 minutes)
 * NOT stored in Redis - verified via JWT signature only
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // 15 minutes
  );
};

/**
 * Generate long-lived refresh token (7 days)
 * Stored in Redis allowlist for revocation support
 */
const generateRefreshToken = (userId) => {
  // Generate unique token ID for this device/session
  const tokenId = crypto.randomBytes(16).toString("hex");

  const refreshToken = jwt.sign(
    { id: userId, tokenId, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // 7 days
  );

  return { refreshToken, tokenId };
};

/**
 * Store refresh token in Redis allowlist
 * Key: refresh:{userId}:{tokenId}
 * TTL: 7 days (auto-expires)
 */
const storeRefreshToken = async (userId, tokenId, deviceInfo = null) => {
  const key = `refresh:${userId}:${tokenId}`;
  const value = JSON.stringify({
    userId: userId.toString(),
    tokenId,
    createdAt: new Date().toISOString(),
    deviceInfo,
  });

  // Store with 7-day TTL (604800 seconds)
  await redisClient.setEx(key, 604800, value);
};

/**
 * Verify refresh token exists in Redis allowlist
 * Returns token data if valid, null if revoked/expired
 */
const verifyRefreshToken = async (userId, tokenId) => {
  const key = `refresh:${userId}:${tokenId}`;
  const data = await redisClient.get(key);

  if (!data) {
    return null; // Token revoked or expired
  }

  return JSON.parse(data);
};

/**
 * Revoke refresh token (logout from specific device)
 */
const revokeRefreshToken = async (userId, tokenId) => {
  const key = `refresh:${userId}:${tokenId}`;
  await redisClient.del(key);
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
const revokeAllRefreshTokens = async (userId) => {
  const pattern = `refresh:${userId}:*`;
  const keys = await redisClient.keys(pattern);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  return keys.length; // Return number of tokens revoked
};

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Password strength checker
 * Requires: 8+ chars, 3 of 4 (uppercase, lowercase, numbers, special chars)
 */
const isStrongPassword = (password) => {
  if (password.length < 8) return false;

  let count = 0;
  if (/[A-Z]/.test(password)) count++;
  if (/[a-z]/.test(password)) count++;
  if (/[0-9]/.test(password)) count++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) count++;

  return count >= 3;
};

// ============================================================================
// AUTH OPERATIONS
// ============================================================================

/**
 * Sign Up
 * Creates new user and returns access + refresh tokens
 */
const signup = async ({ name, email, password }, deviceInfo = null) => {
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Password validation
  if (!isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters and contain uppercase, lowercase, and numbers"
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Generate both tokens
  const accessToken = generateAccessToken(user._id);
  const { refreshToken, tokenId } = generateRefreshToken(user._id);

  // Store refresh token in Redis
  await storeRefreshToken(user._id, tokenId, deviceInfo);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Login
 * Authenticates user and returns access + refresh tokens
 */
const login = async ({ email, password }, deviceInfo = null) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate both tokens
  const accessToken = generateAccessToken(user._id);
  const { refreshToken, tokenId } = generateRefreshToken(user._id);

  // Store refresh token in Redis
  await storeRefreshToken(user._id, tokenId, deviceInfo);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh Access Token
 * Validates refresh token and issues new access token
 * 
 * Security: Refresh token must exist in Redis allowlist
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  try {
    // Verify JWT signature and expiration
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Validate token type
    if (decoded.type !== "refresh") {
      throw new ApiError(401, "Invalid token type");
    }

    // Check if token exists in Redis allowlist (not revoked)
    const tokenData = await verifyRefreshToken(decoded.id, decoded.tokenId);

    if (!tokenData) {
      throw new ApiError(401, "Refresh token revoked or expired");
    }

    // Verify user still exists
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // ============================================================
    // REFRESH TOKEN ROTATION (Security Best Practice)
    // ============================================================
    // Generate NEW refresh token and revoke the old one
    // This prevents replay attacks - if old token is used again, it's invalid
    // ============================================================

    // Revoke the old refresh token
    await revokeRefreshToken(decoded.id, decoded.tokenId);

    // Generate new access token (15min)
    const accessToken = generateAccessToken(user._id);

    // Generate new refresh token (7d) with new tokenId
    const { refreshToken: newRefreshToken, tokenId: newTokenId } = generateRefreshToken(user._id);

    // Store new refresh token in Redis
    await storeRefreshToken(user._id, newTokenId, tokenData.deviceInfo);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken: newRefreshToken, // Return NEW refresh token (rotation)
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // JWT verification errors
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};

/**
 * Logout (from current device)
 * Revokes the specific refresh token
 */
const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token required");
  }

  try {
    // Decode token to get userId and tokenId
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Revoke this specific token
    await revokeRefreshToken(decoded.id, decoded.tokenId);

    return {
      message: "Logged out successfully",
    };
  } catch (error) {
    // Even if token is invalid, consider it a successful logout
    return {
      message: "Logged out successfully",
    };
  }
};

/**
 * Logout from all devices
 * Revokes all refresh tokens for the user
 */
const logoutAll = async (userId) => {
  const revokedCount = await revokeAllRefreshTokens(userId);

  return {
    message: "Logged out from all devices",
    devicesLoggedOut: revokedCount,
  };
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
};
