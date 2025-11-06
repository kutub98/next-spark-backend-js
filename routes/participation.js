const express = require("express");
const router = express.Router();
const multer = require("multer");
const participationController = require("../controllers/participationController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/answers");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Public routes
router.get("/", participationController.getParticipations);
router.get("/quiz/:quizId", participationController.getParticipationsByQuiz);
router.post("/check", participationController.checkParticipation);
router.get("/:id", participationController.getParticipationById);

router.get(
  "/quiz/:quizId/leaderboard",
  // authenticate,
  participationController.getLeaderboard
);
router.post("/", authenticate, participationController.createParticipation);
router.put("/:id", authenticate, participationController.updateParticipation);
router.patch("/:id", authenticate, participationController.updateParticipation);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  participationController.deleteParticipation
);
router.post(
  "/:id/submit-answer",
  authenticate,
  // upload.array("images"),
  participationController.submitParticipationAnswer
);
router.post(
  "/:id/complete",
  authenticate,
  participationController.completeParticipation
);

module.exports = router;
