const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

// Create Quiz
const createQuiz = async (req, res) => {
  try {
    // Add createdBy from authenticated user
    const quizData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    console.log("Creating quiz with data:", quizData);

    const quiz = await Quiz.create(quizData);
    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create quiz",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all Quizzes
const getQuizzes = async (req, res) => {
  try {
    const { status, populate, createdBy } = req.query;
    let query = Quiz.find();

    // Filter by status if provided
    if (status) {
      query = query.where({ status });
    }

    // Filter by creator if provided
    if (createdBy) {
      query = query.where({ createdBy });
    }

    // Populate questions if requested
    if (populate === "questions") {
      query = query.populate("questions");
    }

    // Populate eventId if requested
    if (populate === "eventId") {
      query = query.populate("eventId", "title description startDate endDate");
    }

    const quizzes = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Quizzes fetched successfully",
      data: quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single Quiz
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { populate } = req.query;

    let query = Quiz.findById(id);

    if (populate === "questions") {
      query = query.populate("questions");
    }

    if (populate === "eventId") {
      query = query.populate("eventId", "title description startDate endDate");
    }

    const quiz = await query;

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz fetched successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const quiz = await Quiz.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update quiz",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete Quiz
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get quizzes by event
const getQuizzesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { populate } = req.query;

    let query = Quiz.find({ eventId });

    if (populate === "questions") {
      query = query.populate("questions");
    }

    if (populate === "eventId") {
      query = query.populate("eventId", "title description startDate endDate");
    }

    const quizzes = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Event quizzes fetched successfully",
      data: quizzes,
    });
  } catch (error) {
    console.error("Get quizzes by event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event quizzes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get quiz statistics
const getQuizStats = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get question count
    const questionCount = await Question.countDocuments({ quiz: id });

    // Get participation count (if Participation model exists)
    // const participationCount = await Participation.countDocuments({ quiz: id });

    const stats = {
      totalQuestions: questionCount,
      totalAttempts: quiz.totalAttempts || 0,
      averageScore: quiz.averageScore || 0,
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      status: quiz.status,
      isActive: quiz.isActive,
      isTimeActive: quiz.isTimeActive(),
      hasStarted: quiz.hasStarted(),
      hasEnded: quiz.hasEnded(),
    };

    res.json({
      success: true,
      message: "Quiz statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get quiz stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizzesByEvent,
  getQuizStats,
};
