const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    img: {
      type: String,
      required: [true, "Offer image is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Offer amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    dailyGift: {
      type: Number,
      required: [true, "Daily gift amount is required"],
      min: [0, "Daily gift cannot be negative"],
    },
    dayLength: {
      type: Number,
      required: [true, "Day length is required"],
      min: [1, "Day length must be at least 1"],
    },
    status: {
      type: String,
      enum: ["approved", "delete", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
offerSchema.index({ status: 1 });

module.exports = mongoose.model("Offer", offerSchema);
