const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate, requireRole } = require("../middleware/auth");
const handleValidationErrors = require("../middleware/validation");
const upload = require("../config/multer");

// Validation rules
const registerValidation = [
  body("fullNameBangla")
    .notEmpty()
    .withMessage("Full name in Bangla is required"),
  body("fullNameEnglish")
    .notEmpty()
    .withMessage("Full name in English is required"),
  body("age")
    .isInt({ min: 5, max: 100 })
    .withMessage("Age must be between 5 and 100"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("address").notEmpty().withMessage("Address is required"),
  body("grade").notEmpty().withMessage("Grade/Class is required"),
  body("contact").notEmpty().withMessage("Contact is required"),
  body("contactType")
    .isIn(["phone", "email"])
    .withMessage("Contact type must be phone or email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("contact").notEmpty().withMessage("Contact is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// Public routes
router.post(
  "/register",
  upload.single("profileImage"),
  registerValidation,
  handleValidationErrors,
  authController.register
);
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  authController.login
);
router.post("/check-user", authController.checkUserExists);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.getProfile);
router.put(
  "/profile",
  upload.single("profileImage"),
  authenticate,
  authController.updateProfile
);
router.put(
  "/change-password",
  changePasswordValidation,
  handleValidationErrors,
  authenticate,
  authController.changePassword
);

// Admin only routes
router.get(
  "/admin/users",
  authenticate,
  requireRole(["admin"]),
  authController.getAllUsersForAdmin
);
router.get(
  "/admin/users/:userId",
  authenticate,
  requireRole(["admin"]),
  authController.getUserDetailsWithParticipations
);

router.post(
  "/admin/register",
  authenticate,
  requireRole(["admin"]),
  upload.single("profileImage"),
  authController.registerByAdmin
);

module.exports = router;
