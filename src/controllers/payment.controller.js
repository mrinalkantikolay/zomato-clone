const paymentService = require("../services/payment.service");
const PaymentDTO = require("../dtos/payment.dto");
const asyncHandler = require("../utils/asyncHandler");
const AuditLogger = require("../utils/auditLogger");

/**
 * CREATE DUMMY RAZORPAY PAYMENT ORDER
 * ----------------------------------
 */
const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const payment = await paymentService.createRazorpayOrder(
    req.user._id,
    orderId
  );

  // Audit log: Payment creation
  await AuditLogger.log(
    AuditLogger.buildParams(req, AuditLogger.ACTIONS.PAYMENT_CREATE, {
      resourceType: "payment",
      resourceId: payment._id.toString(),
      metadata: { orderId, amount: payment.amount },
    })
  );

  res.status(201).json({
    success: true,
    message: "Razorpay order created",
    data: PaymentDTO.toDTO(payment),
  });
});

/**
 * VERIFY DUMMY RAZORPAY PAYMENT
 * ----------------------------
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyRazorpayPayment(req.body);

  // Audit log: Payment verification
  await AuditLogger.log(
    AuditLogger.buildParams(req, AuditLogger.ACTIONS.PAYMENT_VERIFY, {
      resourceType: "payment",
      resourceId: payment._id.toString(),
      metadata: {
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
      },
    })
  );

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: PaymentDTO.toDTO(payment),
  });
});

/**
 * GET USER PAYMENTS (WITH PAGINATION)
 * ----------------------------------
 */
const getUserPayments = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const result = await paymentService.getUserPayments(
    req.user._id,
    page,
    limit
  );

  res.status(200).json({
    success: true,
    ...PaymentDTO.toPaginatedDTO(result),
  });
});

module.exports = {
  createPayment,
  verifyPayment,
  getUserPayments,
};