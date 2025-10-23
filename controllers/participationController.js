const Participation = require("../models/Participation");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const User = require("../models/User");

// Create Participation
const createParticipation = async (req, res) => {
  try {
    const {
      user,
      studentId,
      quiz,
      quizId,
      startTime,
      answers,
      totalScore,
      status,
    } = req.body;

    // Support both user/studentId and quiz/quizId field names
    const userId = user || studentId;
    const quizIdValue = quiz || quizId;

    if (!userId || !quizIdValue) {
      return res.status(400).json({
        success: false,
        message: "User ID and Quiz ID are required",
      });
    }

    // Check if user already participated in this quiz
    const existingParticipation = await Participation.findOne({
      user: userId,
      quiz: quizIdValue,
    });
    if (existingParticipation) {
      return res.status(400).json({
        success: false,
        message: "User has already participated in this quiz",
      });
    }

    // Get quiz details
    const quizDetails = await Quiz.findById(quizIdValue);
    if (!quizDetails) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get total questions count
    const totalQuestions = await Question.countDocuments({ quiz: quizIdValue });

    // Calculate results if answers are provided
    let calculatedAnswers = [];
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let attemptedQuestions = 0;
    let obtainedMarks = 0;

    if (answers && Array.isArray(answers)) {
      attemptedQuestions = answers.filter((a) => a.selectedOption).length;

      for (const answer of answers) {
        if (answer.isCorrect) {
          correctAnswers++;
        } else if (answer.selectedOption) {
          wrongAnswers++;
        }
        obtainedMarks += answer.marksObtained || 0;

        calculatedAnswers.push({
          question: answer.questionId,
          answer: answer.selectedOption || answer.participantAnswer,
          isCorrect: answer.isCorrect || false,
          marksObtained: answer.marksObtained || 0,
          answeredAt: new Date(),
        });
      }
    }

    const participation = await Participation.create({
      user: userId,
      quiz: quizIdValue,
      startTime: startTime || new Date(),
      totalQuestions,
      answers: calculatedAnswers,
      attemptedQuestions,
      correctAnswers,
      wrongAnswers,
      totalMarks:
        quizDetails.totalQuestions * (quizDetails.marksPerQuestion || 1),
      obtainedMarks: totalScore || obtainedMarks,
      status: status || "in-progress",
    });

    // Populate the participation before sending
    const populatedParticipation = await Participation.findById(
      participation._id
    )
      .populate("user", "fullNameEnglish fullNameBangla contact role")
      .populate("quiz", "title description duration totalQuestions");

    res.status(201).json({
      success: true,
      message: "Participation created successfully",
      data: populatedParticipation,
    });
  } catch (error) {
    console.error("Create participation error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create participation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all Participations
const getParticipations = async (req, res) => {
  try {
    const { user, studentId, quiz, quizId, status, populate } = req.query;
    let query = Participation.find();

    // Filter by user if provided (support both user and studentId)
    const userId = user || studentId;
    if (userId) {
      query = query.where({ user: userId });
    }

    // Filter by quiz if provided (support both quiz and quizId)
    const quizIdValue = quiz || quizId;
    if (quizIdValue) {
      query = query.where({ quiz: quizIdValue });
    }

    // Filter by status if provided
    if (status) {
      query = query.where({ status });
    }

    // Populate user and quiz if requested
    if (populate) {
      const populateFields = populate.split(",");
      if (
        populateFields.includes("user") ||
        populateFields.includes("studentId")
      ) {
        query = query.populate(
          "user",
          "fullNameEnglish fullNameBangla contact role"
        );
      }
      if (
        populateFields.includes("quiz") ||
        populateFields.includes("quizId")
      ) {
        query = query.populate(
          "quiz",
          "title description duration totalQuestions eventId"
        );
      }
    }

    const participations = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Participations fetched successfully",
      data: participations,
    });
  } catch (error) {
    console.error("Get participations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch participations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single Participation
const getParticipationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { populate } = req.query;

    let query = Participation.findById(id);

    if (populate) {
      const populateFields = populate.split(",");
      if (populateFields.includes("user")) {
        query = query.populate(
          "user",
          "fullNameEnglish fullNameBangla contact"
        );
      }
      if (populateFields.includes("quiz")) {
        query = query.populate("quiz", "title description duration");
      }
      if (populateFields.includes("answers.question")) {
        query = query.populate(
          "answers.question",
          "questionText type options correctAnswer"
        );
      }
    }

    const participation = await query;

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Participation not found",
      });
    }

    res.json({
      success: true,
      message: "Participation fetched successfully",
      data: participation,
    });
  } catch (error) {
    console.error("Get participation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch participation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Participation
const updateParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const participation = await Participation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Participation not found",
      });
    }

    res.json({
      success: true,
      message: "Participation updated successfully",
      data: participation,
    });
  } catch (error) {
    console.error("Update participation error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update participation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete Participation
const deleteParticipation = async (req, res) => {
  try {
    const { id } = req.params;

    const participation = await Participation.findByIdAndDelete(id);

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Participation not found",
      });
    }

    res.json({
      success: true,
      message: "Participation deleted successfully",
    });
  } catch (error) {
    console.error("Delete participation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete participation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get participations by quiz
const getParticipationsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { status, populate } = req.query;

    let query = Participation.find({ quiz: quizId });

    if (status) {
      query = query.where({ status });
    }

    if (populate) {
      const populateFields = populate.split(",");
      if (populateFields.includes("user")) {
        query = query.populate(
          "user",
          "fullNameEnglish fullNameBangla contact"
        );
      }
    }

    const participations = await query.sort({ obtainedMarks: -1 });

    res.json({
      success: true,
      message: "Quiz participations fetched successfully",
      data: participations,
    });
  } catch (error) {
    console.error("Get participations by quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz participations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check participation
const checkParticipation = async (req, res) => {
  try {
    const { user, studentId, quiz, quizId } = req.body;

    // Support both user/studentId and quiz/quizId field names
    const userId = user || studentId;
    const quizIdValue = quiz || quizId;

    if (!userId || !quizIdValue) {
      return res.status(400).json({
        success: false,
        message: "User ID and Quiz ID are required",
      });
    }

    const participation = await Participation.findOne({
      user: userId,
      quiz: quizIdValue,
    });

    res.json({
      success: true,
      message: "Participation check completed",
      data: {
        hasParticipated: !!participation,
        exists: !!participation,
        status: participation ? participation.status : null,
        participation: participation || null,
      },
    });
  } catch (error) {
    console.error("Check participation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check participation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Submit participation answer
const submitParticipationAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, answer } = req.body;

    const participation = await Participation.findById(id);
    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Participation not found",
      });
    }

    // Get question details
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if answer is correct
    const isCorrect = question.checkAnswer(answer);
    const marksObtained = isCorrect
      ? question.marks
      : question.negativeMarks || 0;

    // Check if answer already exists
    const existingAnswerIndex = participation.answers.findIndex(
      (ans) => ans.question.toString() === questionId
    );

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      participation.answers[existingAnswerIndex] = {
        question: questionId,
        answer,
        isCorrect,
        marksObtained,
        answeredAt: new Date(),
      };
    } else {
      // Add new answer
      participation.answers.push({
        question: questionId,
        answer,
        isCorrect,
        marksObtained,
        answeredAt: new Date(),
      });
    }

    // Update participation statistics
    participation.attemptedQuestions = participation.answers.length;
    participation.correctAnswers = participation.answers.filter(
      (ans) => ans.isCorrect
    ).length;
    participation.wrongAnswers = participation.answers.filter(
      (ans) => !ans.isCorrect
    ).length;
    participation.obtainedMarks = participation.answers.reduce(
      (sum, ans) => sum + ans.marksObtained,
      0
    );

    await participation.save();

    res.json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        isCorrect,
        marksObtained,
        participation: participation.getSummary(),
      },
    });
  } catch (error) {
    console.error("Submit participation answer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit answer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Complete participation
const completeParticipation = async (req, res) => {
  try {
    const { id } = req.params;

    const participation = await Participation.findById(id);
    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Participation not found",
      });
    }

    // Update participation status
    participation.status = "completed";
    participation.endTime = new Date();
    participation.submittedAt = new Date();
    participation.timeSpent = participation.calculateTimeSpent();

    // Calculate final statistics
    participation.totalMarks = participation.answers.reduce(
      (sum, ans) => sum + ans.marksObtained,
      0
    );

    await participation.save();

    res.json({
      success: true,
      message: "Participation completed successfully",
      data: participation.getSummary(),
    });
  } catch (error) {
    console.error("Complete participation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete participation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createParticipation,
  getParticipations,
  getParticipationById,
  updateParticipation,
  deleteParticipation,
  getParticipationsByQuiz,
  checkParticipation,
  submitParticipationAnswer,
  completeParticipation,
};
