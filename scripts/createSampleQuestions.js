const mongoose = require("mongoose");
require("dotenv").config();

const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

async function createSampleQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Find an admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("⚠️ No admin user found. Please create an admin user first.");
      process.exit(1);
    }
    console.log(`Found admin user: ${adminUser.email}`);

    // Find the "বীজ গণিত" quiz
    const mathQuiz = await Quiz.findOne({ title: "বীজ গণিত" });

    if (!mathQuiz) {
      console.log('⚠️ Quiz "বীজ গণিত" not found');
      process.exit(1);
    }

    console.log(`\nFound quiz: ${mathQuiz.title} (${mathQuiz._id})`);

    // Delete existing questions for this quiz
    const deleteResult = await Question.deleteMany({ quiz: mathQuiz._id });
    console.log(`Deleted ${deleteResult.deletedCount} existing questions`);

    // Sample questions
    const sampleQuestions = [
      {
        quiz: mathQuiz._id,
        createdBy: adminUser._id,
        questionText: "যদি x + y = 10 এবং x - y = 2 হয়, তাহলে x এর মান কত?",
        type: "multiple-choice",
        options: [
          { text: "6", isCorrect: true },
          { text: "4", isCorrect: false },
          { text: "8", isCorrect: false },
          { text: "5", isCorrect: false },
        ],
        correctAnswer: "6",
        explanation: "x + y = 10 এবং x - y = 2 যোগ করলে: 2x = 12, সুতরাং x = 6",
        difficulty: "easy",
        marks: 1,
        subject: "Algebra",
        category: "Linear Equations",
        status: "published",
        order: 1,
      },
      {
        quiz: mathQuiz._id,
        createdBy: adminUser._id,
        questionText: "(x + 2)(x - 3) এর বিস্তৃত রূপ কী?",
        type: "multiple-choice",
        options: [
          { text: "x² - x - 6", isCorrect: true },
          { text: "x² + x - 6", isCorrect: false },
          { text: "x² - x + 6", isCorrect: false },
          { text: "x² + x + 6", isCorrect: false },
        ],
        correctAnswer: "x² - x - 6",
        explanation: "(x + 2)(x - 3) = x² - 3x + 2x - 6 = x² - x - 6",
        difficulty: "medium",
        marks: 2,
        subject: "Algebra",
        category: "Expansion",
        status: "published",
        order: 2,
      },
      {
        quiz: mathQuiz._id,
        createdBy: adminUser._id,
        questionText: "x² - 4 কে উৎপাদকে বিশ্লেষণ করুন।",
        type: "multiple-choice",
        options: [
          { text: "(x + 2)(x - 2)", isCorrect: true },
          { text: "(x + 4)(x - 1)", isCorrect: false },
          { text: "(x + 1)(x - 4)", isCorrect: false },
          { text: "(x - 4)(x - 4)", isCorrect: false },
        ],
        correctAnswer: "(x + 2)(x - 2)",
        explanation:
          "x² - 4 = x² - 2² = (x + 2)(x - 2) [a² - b² = (a + b)(a - b)]",
        difficulty: "easy",
        marks: 1,
        subject: "Algebra",
        category: "Factorization",
        status: "published",
        order: 3,
      },
      {
        quiz: mathQuiz._id,
        createdBy: adminUser._id,
        questionText: "যদি 2x + 5 = 15 হয়, তাহলে x এর মান কত?",
        type: "multiple-choice",
        options: [
          { text: "5", isCorrect: true },
          { text: "7", isCorrect: false },
          { text: "10", isCorrect: false },
          { text: "3", isCorrect: false },
        ],
        correctAnswer: "5",
        explanation: "2x + 5 = 15 → 2x = 10 → x = 5",
        difficulty: "easy",
        marks: 1,
        subject: "Algebra",
        category: "Linear Equations",
        status: "published",
        order: 4,
      },
      {
        quiz: mathQuiz._id,
        createdBy: adminUser._id,
        questionText: "(a + b)² এর সূত্র কী?",
        type: "multiple-choice",
        options: [
          { text: "a² + 2ab + b²", isCorrect: true },
          { text: "a² + ab + b²", isCorrect: false },
          { text: "a² - 2ab + b²", isCorrect: false },
          { text: "a² + b²", isCorrect: false },
        ],
        correctAnswer: "a² + 2ab + b²",
        explanation:
          "(a + b)² = (a + b)(a + b) = a² + ab + ab + b² = a² + 2ab + b²",
        difficulty: "easy",
        marks: 1,
        subject: "Algebra",
        category: "Algebraic Identities",
        status: "published",
        order: 5,
      },
    ];

    // Create questions
    const createdQuestions = await Question.insertMany(sampleQuestions);
    console.log(`\n✅ Created ${createdQuestions.length} sample questions:`);
    createdQuestions.forEach((q, index) => {
      console.log(`  ${index + 1}. ${q.questionText.substring(0, 50)}...`);
    });

    // Update quiz totalQuestions
    await Quiz.findByIdAndUpdate(mathQuiz._id, {
      totalQuestions: createdQuestions.length,
    });
    console.log(
      `\n✓ Updated quiz totalQuestions to ${createdQuestions.length}`
    );

    console.log("\n✅ Sample questions created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createSampleQuestions();
