const express = require("express");
const router = express.Router();

const bannerController = require("../controllers/bannerController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", bannerController.getApprovedBanners);

// Protected routes
router.post("/", authenticate, requireAdmin, bannerController.createBanner);
router.get("/admin", authenticate, requireAdmin, bannerController.getBanners);
router.get(
  "/admin/:id",
  authenticate,
  requireAdmin,
  bannerController.getBannerById
);
router.patch("/:id", authenticate, requireAdmin, bannerController.updateBanner);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  bannerController.deleteBanner
);

module.exports = router;
