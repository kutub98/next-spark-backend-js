const express = require("express");
const router = express.Router();

const judgeController = require("../controllers/judgeController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", judgeController.getJudgePanels);
router.get("/:id", judgeController.getJudgePanelById);
router.get("/panel/:panel", judgeController.getJudgePanelByPanel);

// Protected routes
router.post("/", authenticate, requireAdmin, judgeController.createJudgePanel);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  judgeController.updateJudgePanel
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  judgeController.deleteJudgePanel
);

module.exports = router;
