const express = require("express");
const router = express.Router();

const offerController = require("../controllers/offerController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", offerController.getApprovedOffers);

// Protected routes
router.post("/", authenticate, requireAdmin, offerController.createOffer);
router.get("/admin", authenticate, requireAdmin, offerController.getOffers);
router.get(
  "/admin/:id",
  authenticate,
  requireAdmin,
  offerController.getOfferById
);
router.put("/:id", authenticate, requireAdmin, offerController.updateOffer);
router.delete("/:id", authenticate, requireAdmin, offerController.deleteOffer);

module.exports = router;
