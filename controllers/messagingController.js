const Message = require("../models/Message");
const User = require("../models/User");

// Send bulk message
const sendBulkMessage = async (req, res) => {
  try {
    const { userIds, message, messageType } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs are required and must be an array",
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (!messageType || !["sms", "whatsapp", "email"].includes(messageType)) {
      return res.status(400).json({
        success: false,
        message: "Valid message type is required (sms, whatsapp, or email)",
      });
    }

    // Validate that all user IDs exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some user IDs are invalid",
      });
    }

    // Create message record
    const messageRecord = await Message.create({
      message,
      messageType,
      userIds,
      recipientCount: userIds.length,
      sentBy: req.user._id,
      status: "pending",
      deliveryStatus: userIds.map((userId) => ({
        userId,
        status: "sent",
      })),
    });

    // TODO: Implement actual SMS/WhatsApp/Email sending logic
    // For now, just update status to sent
    messageRecord.status = "sent";
    await messageRecord.save();

    res.status(200).json({
      success: true,
      message: `Bulk ${messageType.toUpperCase()} sent successfully`,
      data: {
        messageId: messageRecord._id,
        sentCount: userIds.length,
        messageType,
        status: messageRecord.status,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Send bulk message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get messaging history
const getMessagingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, messageType, status } = req.query;
    const skip = (page - 1) * limit;

    let query = Message.find();

    if (messageType) {
      query = query.where({ messageType });
    }

    if (status) {
      query = query.where({ status });
    }

    const messages = await query
      .populate("sentBy", "fullNameEnglish fullNameBangla contact")
      .populate("userIds", "fullNameEnglish fullNameBangla contact")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments(query.getQuery());

    res.json({
      success: true,
      message: "Messaging history fetched successfully",
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNext: page * limit < totalMessages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get messaging history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messaging history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get messaging statistics
const getMessagingStats = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const smsCount = await Message.countDocuments({ messageType: "sms" });
    const whatsappCount = await Message.countDocuments({
      messageType: "whatsapp",
    });
    const emailCount = await Message.countDocuments({ messageType: "email" });

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthTotal = await Message.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const thisMonthSms = await Message.countDocuments({
      messageType: "sms",
      createdAt: { $gte: startOfMonth },
    });
    const thisMonthWhatsapp = await Message.countDocuments({
      messageType: "whatsapp",
      createdAt: { $gte: startOfMonth },
    });
    const thisMonthEmail = await Message.countDocuments({
      messageType: "email",
      createdAt: { $gte: startOfMonth },
    });

    // Calculate delivery rate
    const deliveredMessages = await Message.countDocuments({
      status: "delivered",
    });
    const deliveryRate =
      totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;

    // Calculate average response time (mock data for now)
    const averageResponseTime = "2.3 minutes";

    const stats = {
      totalMessagesSent: totalMessages,
      smsCount,
      whatsappCount,
      emailCount,
      thisMonth: {
        totalMessages: thisMonthTotal,
        smsCount: thisMonthSms,
        whatsappCount: thisMonthWhatsapp,
        emailCount: thisMonthEmail,
      },
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      averageResponseTime,
    };

    res.json({
      success: true,
      message: "Messaging statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get messaging stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messaging statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single message details
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate("sentBy", "fullNameEnglish fullNameBangla contact")
      .populate("userIds", "fullNameEnglish fullNameBangla contact");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message details fetched successfully",
      data: message,
    });
  } catch (error) {
    console.error("Get message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update message status
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryStatus } = req.body;

    const message = await Message.findByIdAndUpdate(
      id,
      { status, deliveryStatus },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message status updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update message status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  sendBulkMessage,
  getMessagingHistory,
  getMessagingStats,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
};
