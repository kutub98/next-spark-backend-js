const express = require("express");
const router = express.Router();

const participationController = require("../controllers/participationController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", participationController.getParticipations);
router.get("/quiz/:quizId", participationController.getParticipationsByQuiz);
router.post("/check", participationController.checkParticipation);
router.get("/:id", participationController.getParticipationById);

// Protected routes
router.post("/", authenticate, participationController.createParticipation);
router.put("/:id", authenticate, participationController.updateParticipation);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  participationController.deleteParticipation
);
router.post(
  "/:id/submit-answer",
  authenticate,
  participationController.submitParticipationAnswer
);
router.post(
  "/:id/complete",
  authenticate,
  participationController.completeParticipation
);

module.exports = router;
