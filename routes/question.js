const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questionController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", questionController.getQuestions);
router.get("/quiz/:quizId", questionController.getQuestionsByQuiz);
router.get("/type/:type", questionController.getQuestionsByType);
router.post("/:questionId/submit-answer", questionController.submitAnswer);
router.get("/:id", questionController.getQuestionById);

// Protected routes
router.post("/", authenticate, requireAdmin, questionController.createQuestion);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  questionController.updateQuestion
);
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  questionController.updateQuestion
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  questionController.deleteQuestion
);
router.post(
  "/bulk",
  authenticate,
  requireAdmin,
  questionController.bulkCreateQuestions
);
router.delete(
  "/bulk",
  authenticate,
  requireAdmin,
  questionController.bulkDeleteQuestions
);

module.exports = router;
