const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
},

  {
    timestamps: true,
  }

);

// Database Indexes for Performance
userSchema.index({ email: 1 }); // Index on email for faster login/signup queries
userSchema.index({ role: 1 }); // Index on role for admin queries

module.exports = mongoose.model("User", userSchema);