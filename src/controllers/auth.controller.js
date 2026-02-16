const authService = require("../services/auth.service");
const UserDTO = require("../dtos/user.dto");
const asyncHandler = require("../utils/asyncHandler");
const AuditLogger = require("../utils/auditLogger");

/**
 * Auth Controller
 * 
 * Handles authentication endpoints with:
 * - Dual-token system (access + refresh)
 * - Audit logging for security events
 * - HttpOnly cookies for refresh tokens
 */

// ============================================================================
// SIGNUP
// ============================================================================

const signup = asyncHandler(async (req, res) => {
  // Extract device info for audit trail
  const deviceInfo = AuditLogger.getUserAgent(req);

  const result = await authService.signup(req.body, deviceInfo);

  // Set refresh token in httpOnly cookie (secure, not accessible via JS)
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Audit log: User signup
  // NOTE: Do NOT spread req — it loses non-enumerable properties (headers, socket)
  // which causes AuditLogger.getIpAddress to crash with TypeError
  req.user = result.user;
  await AuditLogger.log(
    AuditLogger.buildParams(req, AuditLogger.ACTIONS.USER_SIGNUP)
  );

  // Use DTO to sanitize response
  const response = UserDTO.toAuthDTO(result.user, result.accessToken);

  res.status(201).json({
    success: true,
    message: "Signup successful",
    data: response,
  });
});

// ============================================================================
// LOGIN
// ============================================================================

const login = asyncHandler(async (req, res) => {
  // Extract device info for audit trail
  const deviceInfo = AuditLogger.getUserAgent(req);

  const result = await authService.login(req.body, deviceInfo);

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Audit log: User login
  req.user = result.user;
  await AuditLogger.log(
    AuditLogger.buildParams(req, AuditLogger.ACTIONS.USER_LOGIN)
  );

  // Use DTO to sanitize response
  const response = UserDTO.toAuthDTO(result.user, result.accessToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: response,
  });
});

// ============================================================================
// REFRESH TOKEN
// ============================================================================

const refresh = asyncHandler(async (req, res) => {
  // Get refresh token from httpOnly cookie
  const refreshToken = req.cookies.refreshToken;

  const result = await authService.refreshAccessToken(refreshToken);

  // ============================================================
  // TOKEN ROTATION: Set new refresh token cookie
  // ============================================================
  // The service returns a NEW refresh token, we must update the cookie
  // This invalidates the old token and prevents replay attacks
  // ============================================================
  if (result.refreshToken) {
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  // Audit log: Token refresh
  req.user = result.user;
  await AuditLogger.log(
    AuditLogger.buildParams(req, AuditLogger.ACTIONS.TOKEN_REFRESH)
  );

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      // Note: refreshToken is in httpOnly cookie, not in response body
    },
  });
});




// ============================================================================
// LOGOUT (CURRENT DEVICE)
// ============================================================================

const logout = asyncHandler(async (req, res) => {
  // Get refresh token from httpOnly cookie
  const refreshToken = req.cookies.refreshToken;

  await authService.logout(refreshToken);

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Audit log: User logout
  await AuditLogger.log(
    AuditLogger.buildParams(req, AuditLogger.ACTIONS.USER_LOGOUT)
  );

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ============================================================================
// LOGOUT ALL DEVICES
// ============================================================================

const logoutAll = asyncHandler(async (req, res) => {
  // User must be authenticated (req.user from protect middleware)
  const userId = req.user._id;

  const result = await authService.logoutAll(userId);

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Audit log: Logout from all devices
  await AuditLogger.log(
    AuditLogger.buildParams(req, AuditLogger.ACTIONS.USER_LOGOUT, {
      metadata: { devicesLoggedOut: result.devicesLoggedOut },
    })
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      devicesLoggedOut: result.devicesLoggedOut,
    },
  });
});

// ============================================================================
// GET CURRENT USER
// ============================================================================

const getMe = asyncHandler(async (req, res) => {
  // req.user is already populated by the protect middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

module.exports = {
  signup,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
};