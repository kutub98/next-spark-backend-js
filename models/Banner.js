const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Banner description is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Banner image is required"],
    },
    buttonText: {
      type: String,
      default: "Learn More",
      trim: true,
    },
    buttonLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bannerSchema.index({ status: 1, isActive: 1 });
bannerSchema.index({ order: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
