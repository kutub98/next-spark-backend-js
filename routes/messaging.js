const express = require("express");
const router = express.Router();

const messagingController = require("../controllers/messagingController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Protected routes (Admin only)
router.post(
  "/bulk-sms",
  authenticate,
  requireAdmin,
  messagingController.sendBulkMessage
);
router.get(
  "/history",
  authenticate,
  requireAdmin,
  messagingController.getMessagingHistory
);
router.get(
  "/stats",
  authenticate,
  requireAdmin,
  messagingController.getMessagingStats
);
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  messagingController.getMessageById
);
router.put(
  "/:id/status",
  authenticate,
  requireAdmin,
  messagingController.updateMessageStatus
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  messagingController.deleteMessage
);

module.exports = router;
