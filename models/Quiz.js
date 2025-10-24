const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },

    // Time settings
    duration: {
      type: Number, // in minutes
      required: [true, "Quiz duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [300, "Duration cannot exceed 300 minutes"],
    },

    // Question settings
    totalQuestions: {
      type: Number,
      required: [true, "Total questions count is required"],
      min: [1, "Must have at least 1 question"],
    },
    questionsPerPage: {
      type: Number,
      default: 1,
      min: [1, "Must show at least 1 question per page"],
    },

    // Scoring
    totalMarks: {
      type: Number,
      min: [0, "Total marks cannot be less than 0"],
    },
    passingMarks: {
      type: Number,
      min: [0, "Passing marks cannot be less than 0"],
    },
    marksPerQuestion: {
      type: Number,
      default: 1,
      min: [0.5, "Marks per question must be at least 0.5"],
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, "Negative marks cannot be less than 0"],
    },

    // Quiz settings
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    shuffleOptions: {
      type: Boolean,
      default: true,
    },
    allowReview: {
      type: Boolean,
      default: true,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },

    // Access control
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Schedule
    startTime: {
      type: Date,
      required: [true, "Quiz start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "Quiz end time is required"],
    },

    // Results
    showResults: {
      type: Boolean,
      default: true,
    },
    resultReleaseTime: {
      type: Date,
    },

    // Statistics
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },

    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Event reference
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizSchema.index({ createdBy: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ startTime: 1, endTime: 1 });
quizSchema.index({ isActive: 1 });

// Check if quiz time is active
quizSchema.methods.isTimeActive = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.status === "published" &&
    now >= this.startTime &&
    now <= this.endTime
  );
};

// Check if quiz has ended
quizSchema.methods.hasEnded = function () {
  return new Date() > this.endTime;
};

// Check if quiz has started
quizSchema.methods.hasStarted = function () {
  return new Date() >= this.startTime;
};

module.exports = mongoose.model("Quiz", quizSchema);
