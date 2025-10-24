const express = require("express");
const router = express.Router();

const timeInstructionController = require("../controllers/timeInstructionController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", timeInstructionController.getLatestTimeInstruction);

// Protected routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  timeInstructionController.createTimeInstruction
);
router.get(
  "/admin",
  authenticate,
  requireAdmin,
  timeInstructionController.getTimeInstructions
);
router.get(
  "/admin/:id",
  authenticate,
  requireAdmin,
  timeInstructionController.getTimeInstructionById
);
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  timeInstructionController.updateTimeInstruction
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  timeInstructionController.deleteTimeInstruction
);

module.exports = router;
