const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const orderController = require("../controllers/order.controller");

router.post("/", protect, orderController.placeOrder);

router.get("/", protect, orderController.getUserOrders);

module.exports = router;