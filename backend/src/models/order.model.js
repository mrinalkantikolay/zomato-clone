const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuId: Number,
  name: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurantId: {
      type: Number,
      required: true,
    },

    items: [orderItemSchema],
    totalAmount: Number,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // ========== NEW FIELDS FOR TRACKING ==========
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
    },

    deliveryLocation: {
      latitude: {
        type: Number,
        default: 0,
      },
      longitude: {
        type: Number,
        default: 0,
      },
      updatedAt: {
        type: Date,
      },
    },

    estimatedDeliveryTime: {
      type: Date,
    },

    statusHistory: [
      {
        status: String,
        timestamp: Date,
        updatedBy: String,
      },
    ],
    // ============================================
  },
  {
    timestamps: true,
  }
);

// Database Indexes for Performance
orderSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user order history (sorted by date)
orderSchema.index({ status: 1 }); // Index on status for admin filtering
orderSchema.index({ restaurantId: 1 }); // Index on restaurantId for restaurant-specific queries
orderSchema.index({ deliveryPartner: 1 }); // NEW INDEX for delivery partner queries

module.exports = mongoose.model("Order", orderSchema);