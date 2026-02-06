/**
 * @swagger
 * tags:
 *   name: Order Tracking
 *   description: Real-time order tracking and delivery updates
 */

const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const orderTrackingController = require("../controllers/orderTracking.controller");

/**
 * @swagger
 * /api/orders/{orderId}/track:
 *   get:
 *     summary: Get order tracking information
 *     description: Get real-time tracking details for a specific order including delivery partner location and status history
 *     tags: [Order Tracking]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order tracking information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OrderTracking'
 *       404:
 *         description: Order not found
 */
// Get order tracking info (public or authenticated)
router.get("/:orderId/track", orderTrackingController.getOrderTracking);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update the status of an order (Admin/Restaurant only)
 *     tags: [Order Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, out_for_delivery, delivered, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
// Update order status (Admin/Restaurant only)
router.patch("/:orderId/status", protect, orderTrackingController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/assign:
 *   post:
 *     summary: Assign delivery partner to order
 *     description: Assign a delivery partner to an order (Admin only)
 *     tags: [Order Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryPartnerId
 *             properties:
 *               deliveryPartnerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Delivery partner assigned successfully
 *       400:
 *         description: Delivery partner not available
 *       404:
 *         description: Order or delivery partner not found
 */
// Assign delivery partner (Admin only)
router.post("/:orderId/assign", protect, orderTrackingController.assignDeliveryPartner);

/**
 * @swagger
 * /api/orders/{orderId}/location:
 *   patch:
 *     summary: Update delivery location
 *     description: Update delivery partner's current GPS location (Delivery partner app)
 *     tags: [Order Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 28.6139
 *               longitude:
 *                 type: number
 *                 example: 77.2090
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: No delivery partner assigned
 *       404:
 *         description: Order not found
 */
// Update delivery location (Delivery partner app)
router.patch("/:orderId/location", protect, orderTrackingController.updateDeliveryLocation);

/**
 * @swagger
 * /api/orders/{orderId}/delivered:
 *   post:
 *     summary: Mark order as delivered
 *     description: Mark an order as delivered (Delivery partner)
 *     tags: [Order Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryPartnerId
 *             properties:
 *               deliveryPartnerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *       404:
 *         description: Order not found
 */
// Mark as delivered (Delivery partner)
router.post("/:orderId/delivered", protect, orderTrackingController.markAsDelivered);

module.exports = router;
