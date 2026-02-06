const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePhoto: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "car"],
      default: "bike",
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    currentLocation: {
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
        default: Date.now,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    activeOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
deliveryPartnerSchema.index({ isAvailable: 1 });
deliveryPartnerSchema.index({ phone: 1 });
deliveryPartnerSchema.index({ email: 1 });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
