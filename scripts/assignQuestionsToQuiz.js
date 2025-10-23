const mongoose = require("mongoose");
require("dotenv").config();

const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

async function assignQuestionsToQuiz() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Find all quizzes
    const quizzes = await Quiz.find();
    console.log(`\nFound ${quizzes.length} quiz(zes)`);

    if (quizzes.length === 0) {
      console.log("⚠️ No quizzes found. Please create a quiz first.");
      process.exit(1);
    }

    // Find orphan questions (questions without quiz)
    const orphanQuestions = await Question.find({
      $or: [{ quiz: null }, { quiz: { $exists: false } }],
    });

    console.log(`Found ${orphanQuestions.length} orphan questions`);

    if (orphanQuestions.length === 0) {
      console.log("✓ All questions are already assigned to quizzes!");
      process.exit(0);
    }

    // Show available quizzes
    console.log("\nAvailable quizzes:");
    quizzes.forEach((quiz, index) => {
      console.log(`  ${index + 1}. ${quiz.title} (ID: ${quiz._id})`);
    });

    // Use the first quiz (or you can modify this to select a specific quiz)
    const selectedQuiz = quizzes[0];
    console.log(`\n→ Assigning all orphan questions to: ${selectedQuiz.title}`);

    // Update all orphan questions
    const result = await Question.updateMany(
      { $or: [{ quiz: null }, { quiz: { $exists: false } }] },
      { $set: { quiz: selectedQuiz._id } }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} questions`);
    console.log(
      `   All orphan questions are now assigned to quiz: ${selectedQuiz.title}`
    );

    // Update quiz totalQuestions count
    const questionCount = await Question.countDocuments({
      quiz: selectedQuiz._id,
    });
    await Quiz.findByIdAndUpdate(selectedQuiz._id, {
      totalQuestions: questionCount,
    });
    console.log(`   Updated quiz totalQuestions count to: ${questionCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

assignQuestionsToQuiz();

