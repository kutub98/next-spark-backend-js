const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    // Role and Status
    role: {
      type: String,
      enum: ["student", "admin", "volunteer", "representative", "recognition"],
      default: "student",
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    // Basic Information
    fullNameBangla: {
      type: String,
      required: [true, "Full name in Bangla is required"],
      trim: true,
    },
    fullNameEnglish: {
      type: String,
      required: [true, "Full name in English is required"],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [5, "Age must be at least 5"],
      max: [100, "Age cannot exceed 100"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    // Address Information
    union: {
      type: String,
      trim: true,
    },
    postOffice: {
      type: String,
      trim: true,
    },
    upazila: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    // Education Information
    grade: {
      type: String,
      required: [true, "Grade/Class is required"],
      trim: true,
    },
    institutionName: {
      type: String,
      trim: true,
    },
    institutionAddress: {
      type: String,
      trim: true,
    },
    rollId: {
      type: String,
      trim: true,
    },

    // Contact Information
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      unique: true,
      trim: true,
    },
    contactType: {
      type: String,
      enum: ["phone", "email"],
      required: [true, "Contact type is required"],
    },
    parentContact: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },

    // Health Information
    bloodGroup: {
      type: String,
      trim: true,
    },
    specialNeeds: {
      type: String,
      trim: true,
    },

    // Digital Ability
    hasSmartphone: {
      type: Boolean,
      default: false,
    },
    internetUsage: {
      type: String,
      enum: ["always", "sometimes", "never"],
      default: "never",
    },

    // Interests & Goals
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredSubjects: [
      {
        type: String,
        trim: true,
      },
    ],
    futureGoals: {
      type: String,
      trim: true,
    },

    // Profile Image
    profileImage: {
      type: String,
    },

    // Authentication
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    tokens: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },

    // Timestamps
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   try {
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if modified/new
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate auth token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { userId: this._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  this.tokens.push(token);
  this.save();

  return token;
};

// Remove token (logout)
userSchema.methods.removeToken = function (token) {
  this.tokens = this.tokens.filter((t) => t !== token);
  return this.save();
};

// Get public profile
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.verificationToken;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
