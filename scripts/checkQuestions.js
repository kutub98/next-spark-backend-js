const mongoose = require("mongoose");
require("dotenv").config();

const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

async function checkQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Count total questions
    const totalQuestions = await Question.countDocuments();
    console.log(`\nTotal Questions: ${totalQuestions}`);

    if (totalQuestions === 0) {
      console.log("\n⚠️ No questions found in database!");
    } else {
      // Get questions grouped by quiz
      const questionsByQuiz = await Question.aggregate([
        {
          $group: {
            _id: "$quiz",
            count: { $sum: 1 },
          },
        },
      ]);

      console.log("\nQuestions by Quiz:");
      for (const group of questionsByQuiz) {
        if (group._id) {
          const quiz = await Quiz.findById(group._id);
          if (quiz) {
            console.log(`  - Quiz: ${quiz.title} (${group._id})`);
            console.log(`    Questions: ${group.count}`);
          } else {
            console.log(`  - Quiz ID: ${group._id} (Quiz not found)`);
            console.log(`    Questions: ${group.count}`);
          }
        } else {
          console.log(`  - No quiz assigned: ${group.count} questions`);
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkQuestions();

