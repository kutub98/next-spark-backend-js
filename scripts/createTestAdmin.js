const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../models/User");

async function createTestAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Check if test admin already exists
    const existing = await User.findOne({ contact: "testadmin@quiz.com" });
    if (existing) {
      console.log("Test admin already exists. Deleting...");
      await User.deleteOne({ contact: "testadmin@quiz.com" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("test123456", 10);

    // Create test admin
    const admin = await User.create({
      fullNameEnglish: "Test Admin",
      fullNameBangla: "টেস্ট অ্যাডমিন",
      contact: "testadmin@quiz.com",
      contactType: "email",
      password: hashedPassword,
      role: "admin",
      grade: "N/A",
      address: "Test Address",
      age: 30,
      isActive: true,
      isVerified: true,
      tokens: [],
    });

    console.log("✅ Test admin created successfully!\n");
    console.log("Credentials:");
    console.log("  Contact: testadmin@quiz.com");
    console.log("  Password: test123456");
    console.log(`  ID: ${admin._id}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createTestAdmin();
