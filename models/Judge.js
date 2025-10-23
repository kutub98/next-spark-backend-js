const mongoose = require("mongoose");

const judgeMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Judge name is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Judge designation is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Judge image is required"],
      trim: true,
    },
  },
  { _id: false }
);

const judgeSchema = new mongoose.Schema(
  {
    panel: {
      type: String,
      required: [true, "Panel name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Panel description is required"],
      trim: true,
    },
    members: {
      type: [judgeMemberSchema],
      required: [true, "Panel members are required"],
      validate: {
        validator: function (members) {
          return members && members.length > 0;
        },
        message: "At least one panel member is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
judgeSchema.index({ panel: 1 });

module.exports = mongoose.model("Judge", judgeSchema);
