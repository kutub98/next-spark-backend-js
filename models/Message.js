const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Message content
    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["sms", "whatsapp", "email"],
      required: [true, "Message type is required"],
    },

    // Recipients
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    recipientCount: {
      type: Number,
      required: [true, "Recipient count is required"],
      min: [1, "At least one recipient is required"],
    },

    // Sender
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },

    // Status tracking
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending",
    },

    // Delivery tracking
    deliveryStatus: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["sent", "delivered", "failed"],
          default: "sent",
        },
        deliveredAt: Date,
        failureReason: String,
      },
    ],

    // Cost tracking
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },

    // Response tracking
    responses: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        response: {
          type: String,
          trim: true,
        },
        respondedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Metadata
    metadata: {
      campaignId: String,
      templateId: String,
      externalId: String, // ID from external service
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ sentBy: 1, createdAt: -1 });
messageSchema.index({ messageType: 1, status: 1 });
messageSchema.index({ userIds: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for delivery rate
messageSchema.virtual("deliveryRate").get(function () {
  if (this.deliveryStatus.length === 0) return 0;
  const delivered = this.deliveryStatus.filter(
    (ds) => ds.status === "delivered"
  ).length;
  return Math.round((delivered / this.deliveryStatus.length) * 100);
});

// Virtual for response rate
messageSchema.virtual("responseRate").get(function () {
  if (this.deliveryStatus.length === 0) return 0;
  return Math.round((this.responses.length / this.deliveryStatus.length) * 100);
});

// Method to get message summary
messageSchema.methods.getSummary = function () {
  return {
    id: this._id,
    message: this.message,
    messageType: this.messageType,
    recipientCount: this.recipientCount,
    status: this.status,
    deliveryRate: this.deliveryRate,
    responseRate: this.responseRate,
    cost: this.cost,
    createdAt: this.createdAt,
    sentAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Message", messageSchema);
