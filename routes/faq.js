const express = require("express");
const router = express.Router();

const faqController = require("../controllers/faqController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", faqController.getApprovedFaqs);
router.get("/latest", faqController.getLatestFaq);

// Protected routes
router.post("/", authenticate, requireAdmin, faqController.createFaq);
router.get("/admin", authenticate, requireAdmin, faqController.getFaqs);
router.get("/admin/:id", authenticate, requireAdmin, faqController.getFaqById);
router.put("/:id", authenticate, requireAdmin, faqController.updateFaq);
router.delete("/:id", authenticate, requireAdmin, faqController.deleteFaq);

module.exports = router;
