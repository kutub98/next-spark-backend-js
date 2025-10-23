const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Routes
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.put("/change-password", authenticate, authController.changePassword);

// Admin routes
router.get("/all", authenticate, requireAdmin, async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find({})
      .select("-password -tokens")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// Get user details with participations
router.get("/:userId/details", authenticate, requireAdmin, async (req, res) => {
  try {
    const User = require("../models/User");
    const Participation = require("../models/Participation");

    const user = await User.findById(req.params.userId).select(
      "-password -tokens"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const participations = await Participation.find({
      userId: req.params.userId,
    })
      .populate("quizId", "title description")
      .populate("eventId", "title description");

    res.json({
      success: true,
      data: {
        user,
        participations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
});

// Check if user exists
router.post("/check-exists", async (req, res) => {
  try {
    const User = require("../models/User");
    const { contact } = req.body;

    const user = await User.findOne({ contact });

    res.json({
      success: true,
      data: {
        exists: !!user,
        user: user
          ? {
              _id: user._id,
              fullNameEnglish: user.fullNameEnglish,
              fullNameBangla: user.fullNameBangla,
              contact: user.contact,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check user existence",
    });
  }
});

module.exports = router;
