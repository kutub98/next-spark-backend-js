const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: "7d",
  });
};

// Register user
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      fullNameBangla,
      fullNameEnglish,
      fatherName,
      motherName,
      dateOfBirth,
      age,
      gender,
      union,
      postOffice,
      upazila,
      district,
      address,
      grade,
      institutionName,
      institutionAddress,
      rollId,
      contact,
      contactType,
      parentContact,
      whatsappNumber,
      bloodGroup,
      specialNeeds,
      hasSmartphone,
      internetUsage,
      interests,
      preferredSubjects,
      futureGoals,
      password,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ contact });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "এই পরিচিতি নম্বর/ইমেইল দিয়ে ইতিমধ্যেই একজন ব্যবহারকারী নিবন্ধিত",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    let profileImagePath;
    if (req.file) {
      // For memory storage (Vercel), generate filename from buffer
      // Note: Files won't persist on serverless. Use cloud storage (Cloudinary/S3) for production
      const filename =
        req.file.filename ||
        `profileImage-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${path.extname(req.file.originalname || ".jpg")}`;
      profileImagePath = `/uploads/profile-pics/${filename}`;
    }

    // Create new user
    const newUser = new User({
      fullNameBangla,
      fullNameEnglish,
      fatherName,
      motherName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      age: parseInt(age),
      gender,
      union,
      postOffice,
      upazila,
      district,
      address,
      grade,
      institutionName,
      institutionAddress,
      rollId,
      contact,
      contactType,
      parentContact,
      whatsappNumber,
      bloodGroup,
      specialNeeds,
      hasSmartphone: hasSmartphone === "true",
      internetUsage,
      interests: Array.isArray(interests)
        ? interests
        : interests
        ? [interests]
        : [],
      preferredSubjects: Array.isArray(preferredSubjects)
        ? preferredSubjects
        : preferredSubjects
        ? [preferredSubjects]
        : [],
      futureGoals,
      password: hashedPassword,
      profileImage: profileImagePath,
      role: "student",
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id.toString());
    // Store token in user document
    newUser.tokens.push(token);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "ব্যবহারকারী সফলভাবে নিবন্ধিত হয়েছে",
      data: {
        user: {
          _id: newUser._id,
          id: newUser._id,
          fullNameBangla: newUser.fullNameBangla,
          fullNameEnglish: newUser.fullNameEnglish,
          contact: newUser.contact,
          contactType: newUser.contactType,
          role: newUser.role,
          profileImage: newUser.profileImage,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "সার্ভার ত্রুটি",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { contact, password } = req.body;

    console.log("Login attempt for:", contact);

    // Find user by contact
    const user = await User.findOne({ contact, isActive: true });
    if (!user) {
      console.log("User not found:", contact);
      return res.status(404).json({
        success: false,
        message: "ব্যবহারকারী পাওয়া যায়নি",
      });
    }

    console.log("User found:", { contact: user.contact, role: user.role });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", contact);
      return res.status(400).json({
        success: false,
        message: "পাসওয়ার্ড ভুল হয়েছে",
      });
    }

    console.log("Login successful for:", contact, "Role:", user.role);

    // Generate token
    const token = generateToken(user._id.toString());
    // Store token in user document
    user.tokens.push(token);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          id: user._id,
          fullNameBangla: user.fullNameBangla,
          fullNameEnglish: user.fullNameEnglish,
          contact: user.contact,
          contactType: user.contactType,
          role: user.role,
          profileImage: user.profileImage,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check if user exists
const checkUserExists = async (req, res) => {
  try {
    const { contact, contactType } = req.body;
    const user = await User.findOne({ contact, contactType });

    res.status(200).json({
      success: true,
      exists: !!user,
      message: user ? "User exists" : "User not found",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }
    const token = authHeader.substring(7);
    // Remove token from user document
    await User.findByIdAndUpdate(req.user?.userId, {
      $pull: { tokens: token },
    });
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).select(
      "-password -tokens"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ব্যবহারকারী পাওয়া যায়নি",
      });
    }
    // পূর্ণ URL সহ ইমেজ পাথ রিটার্ন করুন
    const userData = user.toObject();
    if (userData.profileImage) {
      userData.profileImage = `${req.protocol}://${req.get("host")}${
        userData.profileImage
      }`;
    }
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "সার্ভার ত্রুটি",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    let updateData = { ...req.body };
    // Explicitly handle dateOfBirth (fix for CastError)
    if (updateData.dateOfBirth) {
      const dateStr = updateData.dateOfBirth;
      if (dateStr && !isNaN(Date.parse(dateStr))) {
        updateData.dateOfBirth = new Date(dateStr);
      } else {
        // If invalid date, remove it (since optional)
        delete updateData.dateOfBirth;
      }
    }
    // Handle age as number
    if (updateData.age) {
      updateData.age = parseInt(updateData.age);
      if (isNaN(updateData.age)) {
        return res.status(400).json({ success: false, message: "অবৈধ বয়স" });
      }
    }
    // Handle boolean fields
    if (updateData.hasSmartphone !== undefined) {
      updateData.hasSmartphone =
        updateData.hasSmartphone === "true" ||
        updateData.hasSmartphone === true;
    }
    // Ensure arrays are arrays (multer should handle multiple appends)
    if (updateData.interests && !Array.isArray(updateData.interests)) {
      updateData.interests = [updateData.interests];
    }
    if (
      updateData.preferredSubjects &&
      !Array.isArray(updateData.preferredSubjects)
    ) {
      updateData.preferredSubjects = [updateData.preferredSubjects];
    }
    // Remove sensitive/locked fields (prevent overwriting)
    delete updateData.password;
    delete updateData.tokens;
    delete updateData.contact;
    delete updateData.contactType;
    delete updateData.role;
    delete updateData.isSuperAdmin;
    delete updateData.isActive;
    // Handle profile image if uploaded
    if (req.file) {
      // For memory storage (Vercel), generate filename from buffer
      const filename =
        req.file.filename ||
        `profileImage-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${path.extname(req.file.originalname || ".jpg")}`;
      updateData.profileImage = `/uploads/profile-pics/${filename}`;

      // Delete old image if exists
      const existingUser = await User.findById(req.user?.userId).select(
        "profileImage"
      );
      if (existingUser && existingUser.profileImage) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          existingUser.profileImage.replace("/uploads", "")
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -tokens");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ব্যবহারকারী পাওয়া যায়নি",
      });
    }
    // Return full URL for image
    const userData = user.toObject();
    if (userData.profileImage) {
      userData.profileImage = `${req.protocol}://${req.get("host")}${
        userData.profileImage
      }`;
    }
    res.status(200).json({
      success: true,
      message: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে",
      data: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    const message =
      process.env.NODE_ENV === "production"
        ? "সার্ভার ত্রুটি"
        : error.message || "সার্ভার ত্রুটি";
    res.status(500).json({ success: false, message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId);
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Password change failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get All Users for Admin
const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("-password -tokens")
      .sort({ createdAt: -1 });

    // Add full URL for profile images
    const usersWithImages = users.map((user) => {
      const userData = user.toObject();
      if (userData.profileImage) {
        userData.profileImage = `${req.protocol}://${req.get("host")}${
          userData.profileImage
        }`;
      }
      return userData;
    });

    res.status(200).json({
      success: true,
      data: usersWithImages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get User Details with Participations
const getUserDetailsWithParticipations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const user = await User.findById(userId).select("-password -tokens");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's participations with populated data
    const participations = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: "participations",
          localField: "_id",
          foreignField: "studentId",
          as: "participations",
        },
      },
      {
        $unwind: { path: "$participations", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "participations.quizId",
          foreignField: "_id",
          as: "participations.quiz",
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "participations.quiz.eventId",
          foreignField: "_id",
          as: "participations.event",
        },
      },
    ]);

    // Add full URL for profile image
    const userData = user.toObject();
    if (userData.profileImage) {
      userData.profileImage = `${req.protocol}://${req.get("host")}${
        userData.profileImage
      }`;
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        participations: participations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  checkUserExists,
  getAllUsersForAdmin,
  getUserDetailsWithParticipations,
};
