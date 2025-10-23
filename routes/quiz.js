const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", quizController.getQuizzes);
router.get("/event/:eventId", quizController.getQuizzesByEvent);
router.get("/:id/stats", quizController.getQuizStats);
router.get("/:id", quizController.getQuizById);

// Protected routes
router.post("/", authenticate, requireAdmin, quizController.createQuiz);
router.put("/:id", authenticate, requireAdmin, quizController.updateQuiz);
router.patch("/:id", authenticate, requireAdmin, quizController.updateQuiz);
router.delete("/:id", authenticate, requireAdmin, quizController.deleteQuiz);

module.exports = router;
