const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // Question content
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    questionImage: {
      type: String, // URL to image
      // default: null,
    },

    // Question type
    type: {
      type: String,
      enum: ["multiple-choice", "true-false", "fill-in-the-blank", "essay"],
      default: "multiple-choice",
    },

    // Options for multiple choice questions
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        image: {
          type: String, // URL to image
          default: null,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Correct answer (for non-multiple choice questions)
    correctAnswer: {
      type: String,
      trim: true,
    },

    // Explanation
    explanation: {
      type: String,
      trim: true,
    },

    // Difficulty level
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Marks
    marks: {
      type: Number,
      default: 1,
      min: [0.5, "Marks must be at least 0.5"],
    },

    // Negative marking
    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, "Negative marks cannot be less than 0"],
    },

    // Subject/Category
    subject: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Statistics
    totalAttempts: {
      type: Number,
      default: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },

    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Quiz reference
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    // Order in quiz
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
questionSchema.index({ createdBy: 1 });
questionSchema.index({ quiz: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ subject: 1, category: 1 });

// Virtual for accuracy percentage
questionSchema.virtual("accuracyPercentage").get(function () {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.correctAttempts / this.totalAttempts) * 100);
});

// Method to check if answer is correct
questionSchema.methods.checkAnswer = function (userAnswer) {
  if (this.type === "multiple-choice") {
    // Find the correct option
    const correctOption = this.options.find((option) => option.isCorrect);
    return correctOption && correctOption.text === userAnswer;
  } else {
    // For other types, compare directly
    return (
      this.correctAnswer &&
      this.correctAnswer.toLowerCase().trim() ===
        userAnswer.toLowerCase().trim()
    );
  }
};

// Method to get correct answer
questionSchema.methods.getCorrectAnswer = function () {
  if (this.type === "multiple-choice") {
    const correctOption = this.options.find((option) => option.isCorrect);
    return correctOption ? correctOption.text : null;
  } else {
    return this.correctAnswer;
  }
};

module.exports = mongoose.model("Question", questionSchema);
