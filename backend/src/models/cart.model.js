const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  menuId: {
    type: Number,
    required: true,
  },

  name: String,
  price: Number,

  quantity: {
    type: Number,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  restaurantId: {
    type: Number,
    required: true,
  },

  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  },
},
  {
    timestamps: true
  }
);

// Database Indexes for Performance
cartSchema.index({ userId: 1 }); // Index on userId for faster cart queries

module.exports = mongoose.model("Cart", cartSchema);