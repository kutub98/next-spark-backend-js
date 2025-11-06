const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Participation = require("../models/Participation");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

// 📦 MULTER SETUP (for answer images)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/answers");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// CREATE PARTICIPATION

// const createParticipation = catchAsync(async (req, res) => {
//   const {
//     user,
//     studentId,
//     quiz,
//     quizId,
//     startTime,
//     answers,
//     totalScore,
//     status,
//   } = req.body;

//   const userId = user || studentId || req.user?._id;
//   const quizIdValue = quiz || quizId;

//   if (!userId || !quizIdValue) {
//     return res.status(400).json({
//       success: false,
//       message: "User ID and Quiz ID are required",
//     });
//   }

//   // Check duplicate participation
//   const existing = await Participation.findOne({
//     user: userId,
//     quiz: quizIdValue,
//   });
//   if (existing) {
//     return res.status(400).json({
//       success: false,
//       message: "User has already participated in this quiz",
//       data: existing,
//     });
//   }

//   const quizDetails = await Quiz.findById(quizIdValue);
//   if (!quizDetails) {
//     return res.status(404).json({ success: false, message: "Quiz not found" });
//   }

//   const totalQuestionsCount = await Question.countDocuments({
//     quiz: quizIdValue,
//   });
//   const totalQuestions = totalQuestionsCount || quizDetails.totalQuestions || 0;

//   // Auto-grade answers
//   let calculatedAnswers = [];
//   let correctAnswers = 0;
//   let wrongAnswers = 0;
//   let attemptedQuestions = 0;
//   let obtainedMarks = 0;

//   if (answers && Array.isArray(answers)) {
//     for (const ans of answers) {
//       const question = await Question.findById(ans.questionId || ans.question);
//       if (!question) continue;

//       const type = question.type || question.questionType;
//       const response = ans.selectedOption || ans.participantAnswer || "";
//       let isCorrect = false;
//       let marksObtained = 0;

//       if (type === "multiple-choice") {
//         isCorrect = question.checkAnswer(response);
//         marksObtained = isCorrect
//           ? question.marks
//           : question.negativeMarks || 0;
//       } else if (type === "fill-in-the-blank") {
//         isCorrect =
//           response.trim().toLowerCase() ===
//           question.correctAnswer.trim().toLowerCase();
//         marksObtained = isCorrect ? question.marks : 0;
//       } else {
//         // Written (manual marking)
//         isCorrect = false;
//         marksObtained = 0;
//       }

//       if (response.trim() !== "") attemptedQuestions++;
//       if (isCorrect) correctAnswers++;
//       else if (response) wrongAnswers++;

//       obtainedMarks += marksObtained;

//       calculatedAnswers.push({
//         question: question._id,
//         answer: response,
//         isCorrect,
//         marksObtained,
//         answeredAt: new Date(),
//       });
//     }
//   }

//   const totalMarks =
//     quizDetails.totalMarks ||
//     totalQuestions * (quizDetails.marksPerQuestion || 1);

//   const participation = await Participation.create({
//     user: userId,
//     quiz: quizIdValue,
//     startTime: startTime || new Date(),
//     totalQuestions,
//     answers: calculatedAnswers,
//     attemptedQuestions,
//     correctAnswers,
//     wrongAnswers,
//     totalMarks,
//     obtainedMarks: totalScore ?? obtainedMarks,
//     status: status || "pending",
//   });

//   const populated = await Participation.findById(participation._id)
//     .populate("user", "fullNameEnglish fullNameBangla contact role")
//     .populate("quiz", "title description duration totalQuestions totalMarks");

//   res.status(201).json({
//     success: true,
//     message: "Participation created successfully",
//     data: populated,
//   });
// });

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

  const userId = user || studentId || req.user?._id;
  const quizIdValue = quiz || quizId;

  if (!userId || !quizIdValue) {
    return res.status(400).json({
      success: false,
      message: "User ID and Quiz ID are required",
    });
  }

  const existing = await Participation.findOne({
    user: userId,
    quiz: quizIdValue,
  });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "User has already participated in this quiz",
      data: existing,
    });
  }

  const quizDetails = await Quiz.findById(quizIdValue);
  if (!quizDetails) {
    return res.status(404).json({ success: false, message: "Quiz not found" });
  }

  const totalQuestionsCount = await Question.countDocuments({
    quiz: quizIdValue,
  });
  const totalQuestions = totalQuestionsCount || quizDetails.totalQuestions || 0;

  let calculatedAnswers = [];
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let attemptedQuestions = 0;
  let obtainedMarks = 0;

  if (answers && Array.isArray(answers)) {
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId || ans.question);
      if (!question) continue;

      const type = question.type || question.questionType;
      const response = ans.selectedOption || ans.participantAnswer || "";
      let isCorrect = false;
      let marksObtained = 0;

      if (type === "multiple-choice") {
        isCorrect = question.checkAnswer(response);
        marksObtained = isCorrect
          ? question.marks
          : question.negativeMarks || 0;
      } else if (type === "fill-in-the-blank") {
        isCorrect =
          response.trim().toLowerCase() ===
          question.correctAnswer.trim().toLowerCase();
        marksObtained = isCorrect ? question.marks : 0;
      } else {
        isCorrect = false;
        marksObtained = 0;
      }

      if (response.trim() !== "") attemptedQuestions++;
      if (isCorrect) correctAnswers++;
      else if (response) wrongAnswers++;

      obtainedMarks += marksObtained;

      calculatedAnswers.push({
        question: question._id,
        answer: response,
        isCorrect,
        marksObtained,
        answeredAt: new Date(),
      });
    }
  }

  const totalMarks =
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
    totalMarks,
    obtainedMarks: totalScore ?? obtainedMarks,
    status: status || "pending",
  });

  // After creating the participation, update the ranking for the quiz
  await updateQuizRanking(quizIdValue); // Ensure ranks are updated

  const populated = await Participation.findById(participation._id)
    .populate("user", "fullNameEnglish fullNameBangla contact role")
    .populate("quiz", "title description duration totalQuestions totalMarks");

  res.status(201).json({
    success: true,
    message: "Participation created successfully",
    data: populated,
  });
});

//  GET ALL PARTICIPATION

const getParticipations = catchAsync(async (req, res) => {
  const { user, studentId, quiz, quizId, status, populate } = req.query;
  let query = Participation.find();

  const userId = user || studentId;
  if (userId) query = query.where({ user: userId });

  const quizIdValue = quiz || quizId;
  if (quizIdValue) query = query.where({ quiz: quizIdValue });

  if (status) query = query.where({ status });

  if (populate) {
    const fields = populate.split(",");
    if (fields.includes("user"))
      query = query.populate(
        "user",
        "fullNameEnglish fullNameBangla contact role"
      );
    if (fields.includes("quiz"))
      query = query.populate(
        "quiz",
        "title description duration totalQuestions eventId"
      );
  }

  const participations = await query.sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Participations fetched successfully",
    data: participations,
  });
});

// GET SINGLE PARTICIPATION

// const getParticipationById = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const { populate } = req.query;

//   let query = Participation.findById(id);
//   if (populate) {
//     const fields = populate.split(",");
//     if (fields.includes("user"))
//       query = query.populate("user", "fullNameEnglish fullNameBangla contact");
//     if (fields.includes("quiz"))
//       query = query.populate("quiz", "title description duration");
//     if (fields.includes("answers.question"))
//       query = query.populate(
//         "answers.question",
//         "questionText type options correctAnswer questionImage"
//       );
//   }

//   const participation = await query;
//   if (!participation)
//     return res
//       .status(404)
//       .json({ success: false, message: "Participation not found" });

//   res.json({
//     success: true,
//     message: "Participation fetched successfully",
//     data: participation,
//   });
// });

const getParticipationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { populate } = req.query;

  let query = Participation.findById(id);

  if (populate) {
    const fields = populate.split(",");

    if (fields.includes("user"))
      query = query.populate("user", "fullNameEnglish fullNameBangla contact");

    if (fields.includes("quiz"))
      query = query.populate("quiz", "title description duration");

    if (fields.includes("answers.question"))
      query = query.populate(
        "answers.question",
        "answerText questionText images questionType type options correctAnswer marks"
      );
  }

  const participation = await query;
  if (!participation)
    return res
      .status(404)
      .json({ success: false, message: "Participation not found" });

  res.json({
    success: true,
    message: "Participation fetched successfully",
    data: participation,
  });
});

//  GET PARTICIPATION BY QUIZ

const getParticipationsByQuiz = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const { status, populate } = req.query;

  let query = Participation.find({ quiz: quizId });
  if (status) query = query.where({ status });
  if (populate?.includes("user"))
    query = query.populate("user", "fullNameEnglish fullNameBangla contact");

  const participations = await query.sort({ obtainedMarks: -1 });
  res.json({
    success: true,
    message: "Quiz participations fetched successfully",
    data: participations,
  });
});

// UPDATE PARTICIPATION

const updateParticipation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { answers, obtainedMarks } = req.body;

  const participation = await Participation.findById(id).populate("quiz");
  if (!participation)
    return res
      .status(404)
      .json({ success: false, message: "Participation not found" });

  if (answers) participation.answers = answers;
  if (typeof obtainedMarks === "number")
    participation.obtainedMarks = obtainedMarks;

  const passingMarks = participation.quiz?.passingMarks || 0;
  participation.status =
    participation.obtainedMarks >= passingMarks ? "completed" : "failed";

  await participation.save();

  res.json({
    success: true,
    message: "Participation updated successfully",
    data: participation,
  });
});

// DELETE PARTICIPATION

const deleteParticipation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await Participation.findByIdAndDelete(id);
  if (!deleted)
    return res
      .status(404)
      .json({ success: false, message: "Participation not found" });

  res.json({ success: true, message: "Participation deleted successfully" });
});

// CHECK PARTICIPATION

const checkParticipation = catchAsync(async (req, res) => {
  const { user, studentId, quiz, quizId } = req.body;
  const userId = user || studentId;
  const quizIdValue = quiz || quizId;

  if (!userId || !quizIdValue)
    return res
      .status(400)
      .json({ success: false, message: "User ID and Quiz ID are required" });

  const participation = await Participation.findOne({
    user: userId,
    quiz: quizIdValue,
  });

  res.json({
    success: true,
    message: "Participation check completed",
    data: {
      hasParticipated: !!participation,
      status: participation?.status || null,
      participation: participation || null,
    },
  });
});

// SUBMIT ANSWER (with image support)

const submitParticipationAnswer = [
  upload.array("images", 5),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { questionId, participantAnswer, selectedOption } = req.body;

    if (!questionId)
      return res
        .status(400)
        .json({ success: false, message: "Question ID is required" });

    const participation = await Participation.findById(id);
    if (!participation)
      return res
        .status(404)
        .json({ success: false, message: "Participation not found" });

    const question = await Question.findById(questionId);
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });

    const images =
      req.files?.map((f) => `/uploads/answers/${f.filename}`) || [];
    const type = question.type || question.questionType;
    const response = participantAnswer || selectedOption || "";

    let isCorrect = false;
    let marksObtained = 0;

    if (type === "multiple-choice") {
      isCorrect = question.checkAnswer(response);
      marksObtained = isCorrect ? question.marks : question.negativeMarks || 0;
    } else if (type === "fill-in-the-blank") {
      isCorrect =
        response.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
      marksObtained = isCorrect ? question.marks : 0;
    } else {
      // Written type needs manual grading
      isCorrect = false;
      marksObtained = 0;
    }

    const answerObj = {
      question: questionId,
      answer: response,
      isCorrect,
      marksObtained,
      answeredAt: new Date(),
      ...(images.length ? { images } : {}),
    };

    const existingIndex = participation.answers.findIndex(
      (a) => a.question.toString() === questionId
    );
    if (existingIndex >= 0) participation.answers[existingIndex] = answerObj;
    else participation.answers.push(answerObj);

    participation.attemptedQuestions = participation.answers.length;
    participation.correctAnswers = participation.answers.filter(
      (a) => a.isCorrect
    ).length;
    participation.wrongAnswers = participation.answers.filter(
      (a) => !a.isCorrect && a.answer
    ).length;
    participation.obtainedMarks = participation.answers.reduce(
      (sum, a) => sum + (a.marksObtained || 0),
      0
    );

    await participation.save();

    res.json({
      success: true,
      message: "Answer submitted successfully",
      data: answerObj,
    });
  }),
];

// const completeParticipation = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const participation = await Participation.findById(id);
//   if (!participation)
//     return res
//       .status(404)
//       .json({ success: false, message: "Participation not found" });

//   participation.status = "completed";
//   participation.endTime = new Date();
//   participation.submittedAt = new Date();
//   participation.timeSpent = participation.calculateTimeSpent?.() || 0;
//   participation.totalMarks = participation.answers.reduce(
//     (sum, a) => sum + (a.marksObtained || 0),
//     0
//   );

//   await participation.save();

//   res.json({
//     success: true,
//     message: "Participation completed successfully",
//     data: participation,
//   });
// });

const updateQuizRanking = async (quizId) => {
  // Fetch participations for the given quiz
  const participations = await Participation.find({ quiz: quizId })
    .populate("user", "fullNameEnglish")
    .sort({ obtainedMarks: -1, timeSpent: 1 }); // Sort by marks first, then by timeSpent

  // Update rank for each participation
  for (let i = 0; i < participations.length; i++) {
    const participation = participations[i];
    participation.rank = i + 1; // Assign rank starting from 1

    // Save the updated participation with rank
    await participation.save();
  }

  console.log(`Updated rankings for quiz ${quizId}`);
};

const completeParticipation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const participation = await Participation.findById(id);
  if (!participation)
    return res
      .status(404)
      .json({ success: false, message: "Participation not found" });

  participation.status = "completed";
  participation.endTime = new Date();
  participation.submittedAt = new Date();
  participation.timeSpent = participation.calculateTimeSpent?.() || 0;
  participation.totalMarks = participation.answers.reduce(
    (sum, a) => sum + (a.marksObtained || 0),
    0
  );

  // Save participation
  await participation.save();

  // After saving the participation, update the rankings
  await updateQuizRanking(participation.quiz); // Pass quiz ID to update ranking

  res.json({
    success: true,
    message: "Participation completed successfully",
    data: participation,
  });
});

const getLeaderboard = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const { limit = 50 } = req.query; // allow ?limit=10, etc.

  // Ensure ranks are up-to-date before returning
  await updateQuizRanking(quizId);

  const participations = await Participation.find({ quiz: quizId })
    .populate("user", "fullNameEnglish fullNameBangla contact role")
    .sort({ obtainedMarks: -1, timeSpent: 1 }) // Sort again if necessary
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    message: "Leaderboard fetched successfully",
    data: participations,
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
  getLeaderboard,
};
