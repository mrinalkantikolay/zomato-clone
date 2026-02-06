/**
 * ADMIN ROUTES
 * ------------
 * All routes are ADMIN ONLY
 */

const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin.controller");

const { updateOrderStatusValidation } = require("../validations/order.validation");
const handleValidationErrors = require("../middlewares/validation.middlewares");

/**
 * ORDERS
 */
router.get(
  "/orders",
  protect,
  authorizeRoles("admin"),
  adminController.getAllOrders
);

router.put(
  "/orders/:orderId",
  protect,
  authorizeRoles("admin"),
  updateOrderStatusValidation,
  handleValidationErrors,
  adminController.updateOrderStatus
);

/**
 * PAYMENTS
 */
router.get(
  "/payments",
  protect,
  authorizeRoles("admin"),
  adminController.getAllPayments
);

/**
 * DASHBOARD
 */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  adminController.getDashboardStats
);

/**
 * LIVE TRACKING
 */
/**
 * @swagger
 * /api/admin/tracking/active-orders:
 *   get:
 *     summary: Get all active orders for live tracking
 *     description: Returns all orders currently being delivered with live GPS locations (Admin only)
 *     tags: [Admin Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active orders with live locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderTracking'
 *       401:
 *         description: Unauthorized
 */
// Get all active orders with live locations
router.get(
  "/tracking/active-orders",
  protect,
  authorizeRoles("admin"),
  adminController.getActiveOrdersForTracking
);

/**
 * @swagger
 * /api/admin/tracking/partner-locations:
 *   get:
 *     summary: Get all delivery partner locations
 *     description: Returns current GPS locations of all delivery partners for map view (Admin only)
 *     tags: [Admin Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery partner locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       partnerId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       location:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                           longitude:
 *                             type: number
 *                       isAvailable:
 *                         type: boolean
 *                       activeOrdersCount:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
// Get all delivery partner locations for map
router.get(
  "/tracking/partner-locations",
  protect,
  authorizeRoles("admin"),
  adminController.getAllDeliveryPartnerLocations
);

/**
 * @swagger
 * /api/admin/tracking/stats:
 *   get:
 *     summary: Get live tracking statistics
 *     description: Returns real-time statistics for admin dashboard (Admin only)
 *     tags: [Admin Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Live tracking statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                     activeOrders:
 *                       type: integer
 *                     totalDeliveryPartners:
 *                       type: integer
 *                     availableDeliveryPartners:
 *                       type: integer
 *                     busyDeliveryPartners:
 *                       type: integer
 *                     ordersByStatus:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
// Get live tracking statistics
router.get(
  "/tracking/stats",
  protect,
  authorizeRoles("admin"),
  adminController.getLiveTrackingStats
);

module.exports = router;