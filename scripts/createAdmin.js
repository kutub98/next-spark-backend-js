const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.DATABASE_URL || "mongodb://localhost:27017/quiz-contest"
    );
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.contact);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      fullNameBangla: "অ্যাডমিন",
      fullNameEnglish: "Admin User",
      contact: "admin@quizcontest.com",
      contactType: "email",
      password: "admin123",
      age: 30,
      gender: "male",
      address: "Admin Address",
      grade: "Admin",
      role: "admin",
      isActive: true,
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    const admin = new User({
      ...adminData,
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Email:", adminData.contact);
    console.log("Password:", adminData.password);
    console.log("Role:", adminData.role);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();
