const Participation = require("../models/Participation");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

// Create Participation
const createParticipation = catchAsync(async (req, res) => {
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
  const userId = user || studentId || req.user?._id;
  const quizIdValue = quiz || quizId;

  console.log("Creating participation:", { userId, quizIdValue });

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
    console.log("Duplicate participation attempt:", { userId, quizIdValue });
    return res.status(400).json({
      success: false,
      message: "User has already participated in this quiz",
      data: existingParticipation,
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

  // Get total questions count from database
  const totalQuestionsCount = await Question.countDocuments({
    quiz: quizIdValue,
  });

  // Use the actual count or fallback to quiz's totalQuestions field
  const totalQuestions =
    totalQuestionsCount > 0
      ? totalQuestionsCount
      : quizDetails.totalQuestions || 0;

  console.log("Quiz details:", {
    quizId: quizIdValue,
    totalQuestions,
    totalQuestionsCount,
    quizDetailsTotalQuestions: quizDetails.totalQuestions,
  });

  // Calculate results if answers are provided
  let calculatedAnswers = [];
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let attemptedQuestions = 0;
  let obtainedMarks = 0;

  if (answers && Array.isArray(answers)) {
    attemptedQuestions = answers.filter(
      (a) => a.selectedOption && a.selectedOption.trim() !== ""
    ).length;

    for (const answer of answers) {
      // Only count if there's an actual answer
      const hasAnswer =
        answer.selectedOption && answer.selectedOption.trim() !== "";

      if (hasAnswer && answer.isCorrect) {
        correctAnswers++;
      } else if (hasAnswer && !answer.isCorrect) {
        wrongAnswers++;
      }

      obtainedMarks += answer.marksObtained || 0;

      calculatedAnswers.push({
        question: answer.questionId,
        answer: answer.selectedOption || answer.participantAnswer || "",
        isCorrect: answer.isCorrect || false,
        marksObtained: answer.marksObtained || 0,
        answeredAt: new Date(),
      });
    }
  }

  console.log("Calculated results:", {
    correctAnswers,
    wrongAnswers,
    attemptedQuestions,
    obtainedMarks,
  });

  // Calculate total marks based on quiz configuration
  const calculatedTotalMarks =
    quizDetails.totalMarks ||
    totalQuestions * (quizDetails.marksPerQuestion || 1);

  const participation = await Participation.create({
    user: userId,
    quiz: quizIdValue,
    startTime: startTime || new Date(),
    totalQuestions,
    answers: calculatedAnswers,
    attemptedQuestions,
    correctAnswers,
    wrongAnswers,
    totalMarks: calculatedTotalMarks,
    obtainedMarks: totalScore !== undefined ? totalScore : obtainedMarks,
    status: status || "completed",
  });

  console.log("Participation created:", participation._id);

  // Populate the participation before sending
  const populatedParticipation = await Participation.findById(participation._id)
    .populate("user", "fullNameEnglish fullNameBangla contact role")
    .populate("quiz", "title description duration totalQuestions totalMarks");

  res.status(201).json({
    success: true,
    message: "Participation created successfully",
    data: populatedParticipation,
  });
});

// Get all Participations
const getParticipations = catchAsync(async (req, res) => {
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
    if (populateFields.includes("quiz") || populateFields.includes("quizId")) {
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
});

// Get single Participation
const getParticipationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { populate } = req.query;

  let query = Participation.findById(id);

  if (populate) {
    const populateFields = populate.split(",");
    if (populateFields.includes("user")) {
      query = query.populate("user", "fullNameEnglish fullNameBangla contact");
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
});

// Update Participation
// const updateParticipation = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const updateData = req.body;

//   const participation = await Participation.findByIdAndUpdate(id, updateData, {
//     new: true,
//     runValidators: true,
//   });

//   if (!participation) {
//     return res.status(404).json({
//       success: false,
//       message: "Participation not found",
//     });
//   }

//   res.json({
//     success: true,
//     message: "Participation updated successfully",
//     data: participation,
//   });
// });

const updateParticipation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { answers, obtainedMarks } = req.body;

  // Find existing participation and populate quiz for passingMarks
  const participation = await Participation.findById(id).populate("quiz");
  if (!participation) {
    return res.status(404).json({
      success: false,
      message: "Participation not found",
    });
  }

  // Update answers and obtainedMarks
  if (answers) participation.answers = answers;
  if (typeof obtainedMarks === "number")
    participation.obtainedMarks = obtainedMarks;

  // Compute status based on passing marks
  const passingMarks = participation.quiz?.passingMarks || 0;
  participation.status =
    participation.obtainedMarks >= passingMarks ? "completed" : "failed";

  // Save the updated participation
  await participation.save();

  res.json({
    success: true,
    message: "Participation updated successfully",
    data: participation,
  });
});

// Delete Participation
const deleteParticipation = catchAsync(async (req, res) => {
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
});

// Get participations by quiz
const getParticipationsByQuiz = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const { status, populate } = req.query;

  let query = Participation.find({ quiz: quizId });

  if (status) {
    query = query.where({ status });
  }

  if (populate) {
    const populateFields = populate.split(",");
    if (populateFields.includes("user")) {
      query = query.populate("user", "fullNameEnglish fullNameBangla contact");
    }
  }

  const participations = await query.sort({ obtainedMarks: -1 });

  res.json({
    success: true,
    message: "Quiz participations fetched successfully",
    data: participations,
  });
});

// Check participation
const checkParticipation = catchAsync(async (req, res) => {
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
});

// Submit participation answer
const submitParticipationAnswer = catchAsync(async (req, res) => {
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
});

// Complete participation
const completeParticipation = catchAsync(async (req, res) => {
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
});

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
