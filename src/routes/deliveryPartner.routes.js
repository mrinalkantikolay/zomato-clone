/**
 * @swagger
 * tags:
 *   name: Delivery Partners
 *   description: Delivery partner management and simulation
 */

const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const deliveryPartnerController = require("../controllers/deliveryPartner.controller");

/**
 * DELIVERY PARTNER SIMULATION ROUTES
 * -----------------------------------
 * Routes for testing delivery partner functionality
 */

/**
 * @swagger
 * /api/delivery-partners:
 *   post:
 *     summary: Create delivery partner
 *     description: Create a new delivery partner for testing/simulation
 *     tags: [Delivery Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - email
 *               - vehicleNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rahul Sharma
 *               phone:
 *                 type: string
 *                 example: '9876543210'
 *               email:
 *                 type: string
 *                 example: rahul@delivery.com
 *               vehicleType:
 *                 type: string
 *                 enum: [bike, scooter, bicycle, car]
 *                 example: bike
 *               vehicleNumber:
 *                 type: string
 *                 example: DL01AB1234
 *     responses:
 *       201:
 *         description: Delivery partner created successfully
 *       400:
 *         description: Partner already exists
 */
// Create delivery partner (for testing)
router.post("/", deliveryPartnerController.createDeliveryPartner);

/**
 * @swagger
 * /api/delivery-partners:
 *   get:
 *     summary: Get all delivery partners
 *     description: List all delivery partners with optional availability filter
 *     tags: [Delivery Partners]
 *     parameters:
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filter by availability status
 *     responses:
 *       200:
 *         description: List of delivery partners
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
 *                     $ref: '#/components/schemas/DeliveryPartner'
 */
// Get all delivery partners
router.get("/", deliveryPartnerController.getAllDeliveryPartners);

/**
 * @swagger
 * /api/delivery-partners/{partnerId}:
 *   get:
 *     summary: Get delivery partner details
 *     description: Get specific delivery partner information
 *     tags: [Delivery Partners]
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery partner ID
 *     responses:
 *       200:
 *         description: Delivery partner details
 *       404:
 *         description: Delivery partner not found
 */
// Get specific delivery partner
router.get("/:partnerId", deliveryPartnerController.getDeliveryPartner);

/**
 * @swagger
 * /api/delivery-partners/accept-order:
 *   post:
 *     summary: Accept order (Simulation)
 *     description: Simulate delivery partner accepting an order assignment
 *     tags: [Delivery Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerId
 *               - orderId
 *             properties:
 *               partnerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               orderId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Order accepted successfully
 *       400:
 *         description: Partner not available
 *       404:
 *         description: Partner or order not found
 */
// Accept order (delivery partner accepts assignment)
router.post("/accept-order", deliveryPartnerController.acceptOrder);

/**
 * @swagger
 * /api/delivery-partners/{partnerId}/location:
 *   patch:
 *     summary: Update location (Simulation)
 *     description: Simulate delivery partner updating their GPS location
 *     tags: [Delivery Partners]
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery partner ID
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
 *               orderId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       404:
 *         description: Delivery partner not found
 */
// Update location (GPS tracking)
router.patch("/:partnerId/location", deliveryPartnerController.updateLocation);

/**
 * @swagger
 * /api/delivery-partners/complete-delivery:
 *   post:
 *     summary: Complete delivery (Simulation)
 *     description: Simulate delivery partner marking order as delivered
 *     tags: [Delivery Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerId
 *               - orderId
 *             properties:
 *               partnerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               orderId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Delivery completed successfully
 *       404:
 *         description: Partner or order not found
 */
// Complete delivery
router.post("/complete-delivery", deliveryPartnerController.completeDelivery);

/**
 * @swagger
 * /api/delivery-partners/simulate-location:
 *   post:
 *     summary: Auto-simulate location updates (Testing)
 *     description: Automatically simulate location updates every 5 seconds for testing
 *     tags: [Delivery Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerId
 *               - orderId
 *             properties:
 *               partnerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               orderId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               duration:
 *                 type: integer
 *                 example: 60
 *                 description: Duration in seconds (default 60)
 *     responses:
 *       200:
 *         description: Location simulation started
 *       404:
 *         description: Partner or order not found
 */
// Simulate automatic location updates (for testing)
router.post("/simulate-location", deliveryPartnerController.simulateLocationUpdates);

module.exports = router;
