const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

async function getAdminCreds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    const admins = await User.find({
      role: { $in: ["admin", "super-admin"] },
    }).select("fullNameEnglish email contact role");

    if (admins.length === 0) {
      console.log("❌ No admin users found!");
      console.log("\nPlease create an admin user using:");
      console.log("  node scripts/createAdmin.js");
    } else {
      console.log(`Found ${admins.length} admin user(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.fullNameEnglish || "N/A"}`);
        console.log(`   Email: ${admin.email || "N/A"}`);
        console.log(`   Contact: ${admin.contact}`);
        console.log(`   Role: ${admin.role}`);
        console.log("");
      });

      console.log(
        "📝 Note: For testing, update testCRUD.js with the contact/email and password"
      );
      console.log(
        "   Default password for newly created admins is usually: 123456"
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

getAdminCreds();

