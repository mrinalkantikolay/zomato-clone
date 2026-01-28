const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },

    status: {
      type: String,
      enum: ["initiated", "success", "failed"],
      default: "initiated",
    },

    //Razorpay specific fields

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

  },
  {
    timestamps: true,
  }
);

// Database Indexes for Performance
paymentSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user payment history
paymentSchema.index({ orderId: 1 }); // Index on orderId for order-payment lookup
paymentSchema.index({ status: 1 }); // Index on status for filtering

module.exports = mongoose.model("Payment", paymentSchema);