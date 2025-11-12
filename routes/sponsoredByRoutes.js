const express = require("express");
const router = express.Router();
const {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  getSponsoredById,
} = require("../controllers/sponsoredByController");

const { authenticate, requireAdmin } = require("../middleware/auth");
const upload = require("../config/multer");

// Public: view sponsors
router.get("/", getSponsors);
router.get("/:id", getSponsoredById);

// Admin only: create, update, delete
router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("sponsoredImage"),
  createSponsor
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  upload.single("sponsoredImage"),
  updateSponsor
);
router.delete("/:id", authenticate, requireAdmin, deleteSponsor);

module.exports = router;
