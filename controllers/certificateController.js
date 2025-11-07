// const Certificate = require("../models/certificate");

// exports.createCertificate = async (req, res) => {
//   try {
//     const {
//       imageUrl,
//       userId,
//       participationId,
//       rank,
//       marks,
//       totalMarks,
//       signatures,
//     } = req.body;

//     if (!imageUrl || !userId || !participationId) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const certificate = await Certificate.create({
//       imageUrl,
//       user: userId,
//       participation: participationId,
//       rank,
//       marks,
//       totalMarks,
//       signatures,
//     });

//     res.status(201).json({ message: "Certificate saved", certificate });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err });
//   }
// };

const Certificate = require("../models/certificate");

// ✅ Create certificate (already done)
exports.createCertificate = async (req, res) => {
  try {
    const {
      imageUrl,
      userId,
      participationId,
      rank,
      marks,
      totalMarks,
      signatures,
    } = req.body;

    if (!imageUrl || !userId || !participationId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const certificate = await Certificate.create({
      imageUrl,
      user: userId,
      participation: participationId,
      rank,
      marks,
      totalMarks,
      signatures,
    });

    res.status(201).json({ message: "Certificate saved", certificate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all certificates
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("user", "fullNameEnglish email")
      .populate("participation", "quizName rank");

    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get certificate by user ID
exports.getCertificatesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const certificates = await Certificate.find({ user: userId })
      .populate("user", "fullNameEnglish email")
      .populate("participation", "quizName rank");
      
    if (!certificates.length) {
      return res.status(404).json({ message: "No certificates found" });
    }

    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get single certificate by participation ID
exports.getCertificateByParticipation = async (req, res) => {
  try {
    const { participationId } = req.params;

    const certificate = await Certificate.findOne({
      participation: participationId,
    })
      .populate("user", "fullNameEnglish email")
      .populate("participation", "quizName rank");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.status(200).json(certificate);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
