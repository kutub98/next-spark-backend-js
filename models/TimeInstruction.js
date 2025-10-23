const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    points: {
      type: [String],
      required: [true, "Section points are required"],
      validate: {
        validator: function (points) {
          return points && points.length > 0;
        },
        message: "At least one point is required",
      },
    },
    bgColor: {
      type: String,
      trim: true,
    },
    textColor: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const timeInstructionSchema = new mongoose.Schema(
  {
    timeline: {
      type: sectionSchema,
      required: [true, "Timeline section is required"],
    },
    instructions: {
      type: sectionSchema,
      required: [true, "Instructions section is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
timeInstructionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("TimeInstruction", timeInstructionSchema);
