const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questionController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Protected bulk routes (must be before single ID routes)
router.post(
  "/bulk",
  authenticate,
  requireAdmin,
  questionController.bulkCreateQuestions
);
router.post(
  "/bulk/delete",
  authenticate,
  requireAdmin,
  questionController.bulkDeleteQuestions
);

// Public routes
router.get("/", questionController.getQuestions);
router.get("/quiz/:quizId", questionController.getQuestionsByQuiz);
router.get("/type/:type", questionController.getQuestionsByType);
router.post("/:questionId/submit-answer", questionController.submitAnswer);
router.get("/:id", questionController.getQuestionById);

// Protected single question routes
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

module.exports = router;
