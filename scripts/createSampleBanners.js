const mongoose = require("mongoose");
require("dotenv").config();

const Banner = require("../models/Banner");

const sampleBanners = [
  {
    title: "স্বাগতম Quiz Contest এ",
    description:
      "আপনার জ্ঞান পরীক্ষা করুন এবং আকর্ষণীয় পুরস্কার জিতুন! আমাদের সাথে যুক্ত হয়ে নিজেকে প্রমাণ করুন।",
    image: "/Asset/prducts/quiz-banner.png",
    buttonText: "এখনই যোগ দিন",
    buttonLink: "/auth",
    status: "approved",
    order: 1,
    isActive: true,
  },
  {
    title: "বিশেষ Quiz প্রতিযোগিতা",
    description:
      "প্রতি সপ্তাহে নতুন Quiz এবং পুরস্কার জেতার সুযোগ। আপনার দক্ষতা দেখান এবং পুরস্কার জিতুন!",
    image: "/Asset/prducts/banner-1-1.png",
    buttonText: "আরও জানুন",
    buttonLink: "/events",
    status: "approved",
    order: 2,
    isActive: true,
  },
  {
    title: "অসাধারণ পুরস্কার জেতার সুযোগ",
    description:
      "Quiz-এ অংশগ্রহণ করুন এবং মূল্যবান উপহার জিতে নিন। সেরা পারফরমারদের জন্য বিশেষ পুরস্কার!",
    image: "/Asset/prducts/banner-1-2.png",
    buttonText: "শুরু করুন",
    buttonLink: "/quiz",
    status: "approved",
    order: 3,
    isActive: true,
  },
];

async function createSampleBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing banners
    await Banner.deleteMany({});
    console.log("✓ Cleared existing banners");

    // Create sample banners
    const banners = await Banner.insertMany(sampleBanners);
    console.log(`✓ Created ${banners.length} sample banners:`);
    banners.forEach((banner, index) => {
      console.log(`  ${index + 1}. ${banner.title} (${banner.status})`);
    });

    console.log("\n✅ Sample banners created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating sample banners:", error);
    process.exit(1);
  }
}

createSampleBanners();
