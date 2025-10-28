const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema(
  {
    // User and Quiz references
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    // Participation details
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },

    // Answers
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: String,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        marksObtained: {
          type: Number,
          default: 0,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Results
    totalQuestions: {
      type: Number,
      required: true,
    },
    attemptedQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["in-progress", "completed", "pending", "abandoned", "timeout"],
      default: "in-progress",
    },

    // Time tracking
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    timeRemaining: {
      type: Number, // in seconds
    },

    // Browser/Device info
    browserInfo: {
      userAgent: String,
      ipAddress: String,
      deviceType: String,
    },

    // Proctoring (if enabled)
    isProctored: {
      type: Boolean,
      default: false,
    },
    proctoringFlags: [
      {
        type: String,
        enum: ["tab-switch", "copy-paste", "right-click", "multiple-tabs"],
      },
    ],

    // Rank/Position
    rank: {
      type: Number,
    },
    percentile: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one participation per user per quiz
participationSchema.index({ user: 1, quiz: 1 }, { unique: true });

// Indexes for performance
participationSchema.index({ quiz: 1, status: 1 });
participationSchema.index({ user: 1, status: 1 });
participationSchema.index({ obtainedMarks: -1 }); // For ranking

participationSchema.pre(/^find/, function (next) {
  this.populate("user", "fullNameEnglish fullNameBangla contact role").populate(
    "quiz",
    "title description duration totalQuestions eventId text"
  );
  next();
});

// Virtual for accuracy percentage
participationSchema.virtual("accuracyPercentage").get(function () {
  if (this.attemptedQuestions === 0) return 0;
  return Math.round((this.correctAnswers / this.attemptedQuestions) * 100);
});

// Virtual for percentage score
participationSchema.virtual("percentageScore").get(function () {
  if (this.totalMarks === 0) return 0;
  return Math.round((this.obtainedMarks / this.totalMarks) * 100);
});

// Method to calculate time spent
participationSchema.methods.calculateTimeSpent = function () {
  if (this.endTime) {
    this.timeSpent = Math.floor((this.endTime - this.startTime) / 1000);
  } else {
    this.timeSpent = Math.floor((new Date() - this.startTime) / 1000);
  }
  return this.timeSpent;
};

// Method to check if participation is valid
participationSchema.methods.isValidParticipation = function () {
  return (
    this.status === "completed" && this.submittedAt && this.answers.length > 0
  );
};

// Method to get participation summary
participationSchema.methods.getSummary = function () {
  return {
    totalQuestions: this.totalQuestions,
    attemptedQuestions: this.attemptedQuestions,
    correctAnswers: this.correctAnswers,
    wrongAnswers: this.wrongAnswers,
    totalMarks: this.totalMarks,
    obtainedMarks: this.obtainedMarks,
    accuracyPercentage: this.accuracyPercentage,
    percentageScore: this.percentageScore,
    timeSpent: this.timeSpent,
    status: this.status,
    rank: this.rank,
    percentile: this.percentile,
  };
};

module.exports = mongoose.model("Participation", participationSchema);
