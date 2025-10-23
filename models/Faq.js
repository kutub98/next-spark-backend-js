const mongoose = require("mongoose");

const singleFaqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "FAQ question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "FAQ answer is required"],
      trim: true,
    },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    faq: {
      type: [singleFaqSchema],
      required: [true, "FAQ items are required"],
      validate: {
        validator: function (faqs) {
          return faqs && faqs.length > 0;
        },
        message: "At least one FAQ item is required",
      },
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
faqSchema.index({ status: 1 });

module.exports = mongoose.model("Faq", faqSchema);
