const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../models/User");

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Find admin user
    const admin = await User.findOne({ contact: "admin2@gmail.com" });

    if (!admin) {
      console.log("❌ Admin user not found");
      process.exit(1);
    }

    console.log(`Found admin: ${admin.fullNameEnglish} (${admin.contact})`);

    // Set new password directly (the pre-save middleware will hash it)
    admin.password = "test123456";
    await admin.save();

    console.log("\n✅ Password updated successfully!");
    console.log("\nNew credentials:");
    console.log("  Contact: admin2@gmail.com");
    console.log("  Password: test123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetAdminPassword();

