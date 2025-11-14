// const sponsoredBy = require("../models/sponsoredBy");

// // Get all sponsors
// exports.getSponsors = async (req, res) => {
//   try {
//     const sponsors = await sponsoredBy.find();
//     res.status(200).json(sponsors);
//   } catch (err) {
//     console.error("Get Sponsors Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // exports.createSponsor = async (req, res) => {
// //   try {
// //     const { name, about } = req.body;
// //     const sponsoredImage = req.file ? req.file.path : undefined; // match schema
// //     const sponsor = new sponsoredBy({ name, about, sponsoredImage });
// //     await sponsor.save();
// //     res.status(201).json(sponsor);
// //   } catch (err) {
// //     console.error("Create Sponsor Error:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // ✅ Get sponsor by ID

// exports.createSponsor = async (req, res) => {
//   try {
//     const { name, about } = req.body;
//     let sponsoredImage;

//     // ✅ Handle in-memory image from Multer
//     if (req.file && req.file.fieldname === "sponsoredImage") {
//       // Temporarily save to local folder for testing (optional)
//       const uploadDir = path.join(__dirname, "../uploads/sponsored");
//       if (!fs.existsSync(uploadDir))
//         fs.mkdirSync(uploadDir, { recursive: true });

//       const filename = `${Date.now()}-${req.file.originalname.replace(
//         /\s+/g,
//         "_"
//       )}`;
//       const filePath = path.join(uploadDir, filename);

//       // Write buffer to disk (only for dev/local)
//       fs.writeFileSync(filePath, req.file.buffer);

//       sponsoredImage = `/uploads/sponsored/${filename}`;
//     }

//     // Validate required image
//     if (!sponsoredImage) {
//       return res.status(400).json({
//         success: false,
//         message: "Sponsored image is required.",
//       });
//     }

//     const sponsor = new sponsoredBy({ name, about, sponsoredImage });
//     await sponsor.save();

//     res.status(201).json({ success: true, sponsor });
//   } catch (err) {
//     console.error("Create Sponsor Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// const fs = require("fs");
// const path = require("path");
// const sponsoredBy = require("../models/sponsoredBy");

const fs = require("fs");
const path = require("path");
const sponsoredBy = require("../models/sponsoredBy");

// exports.createSponsor = async (req, res) => {
//   try {
//     const { name, about } = req.body;

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Sponsored image is required.",
//       });
//     }

//     // Detect serverless runtime (Vercel / AWS Lambda)
//     const isServerless = !!process.env.VERCEL || !!process.env.AWS_REGION;

//     // Generate a unique filename
//     const filename = `sponsored-${Date.now()}-${Math.floor(
//       Math.random() * 1e9
//     )}${path.extname(req.file.originalname || ".jpg")}`;

//     let sponsoredImage;

//     if (!isServerless) {
//       // ============================
//       //   LOCAL ENV — SAVE TO DISK
//       // ============================
//       const uploadDir = path.join(__dirname, "../uploads/sponsored");

//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const filePath = path.join(uploadDir, filename);
//       fs.writeFileSync(filePath, req.file.buffer);

//       // sponsoredImage = `/uploads/sponsored/${filename}`;
//       sponsoredImage = `uploads/sponsored/${filename}`;
//     } else {
//       console.warn(
//         "⚠️ Serverless environment detected — skipping local file save."
//       );

//       // TEMPORARY PATH (replace later with Cloudinary/S3 upload)
//       // sponsoredImage = `/uploads/sponsored/${filename}`;
//       sponsoredImage = `uploads/sponsored/${filename}`;
//     }

//     // Save sponsor data
//     const sponsor = new sponsoredBy({ name, about, sponsoredImage });
//     await sponsor.save();

//     res.status(201).json({
//       success: true,
//       message: "Sponsor created successfully.",
//       sponsor,
//     });
//   } catch (err) {
//     console.error("Create Sponsor Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// Get all sponsors

exports.createSponsor = async (req, res) => {
  try {
    const { name, about } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Sponsored image is required.",
      });
    }

    const filename =
      req.file.filename ||
      `sponsored-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        req.file.originalname || ".jpg"
      )}`;

    const uploadDir = path.join(__dirname, "../uploads/sponsored");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    // ⚠️ Notice: no leading slash
    const sponsoredImage = `uploads/sponsored/${filename}`;

    const sponsor = new sponsoredBy({ name, about, sponsoredImage });
    await sponsor.save();

    res.status(201).json({ success: true, sponsor });
  } catch (err) {
    console.error("Create Sponsor Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await sponsoredBy.find();
    res.status(200).json(sponsors);
  } catch (err) {
    console.error("Get Sponsors Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Create sponsor
// exports.createSponsor = async (req, res) => {
//   try {
//     const { name, about } = req.body;
//     let sponsoredImage;

//     if (req.file && req.file.fieldname === "sponsoredImage") {
//       const uploadDir = path.join(__dirname, "../uploads/sponsored");
//       if (!fs.existsSync(uploadDir))
//         fs.mkdirSync(uploadDir, { recursive: true });

//       const filename = `${Date.now()}-${req.file.originalname.replace(
//         /\s+/g,
//         "_"
//       )}`;
//       const filePath = path.join(uploadDir, filename);

//       fs.writeFileSync(filePath, req.file.buffer);

//       sponsoredImage = `/uploads/sponsored/${filename}`;
//     }

//     if (!sponsoredImage) {
//       return res.status(400).json({
//         success: false,
//         message: "Sponsored image is required.",
//       });
//     }

//     const sponsor = new sponsoredBy({ name, about, sponsoredImage });
//     await sponsor.save();

//     res.status(201).json({ success: true, sponsor });
//   } catch (err) {
//     console.error("Create Sponsor Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.createSponsor = async (req, res) => {
//   try {
//     const { name, about } = req.body;
//     let sponsoredImage;

//     if (req.file && req.file.fieldname === "sponsoredImage") {
//       const filename =
//         req.file.filename ||
//         `sponsored-${Date.now()}-${Math.round(
//           Math.random() * 1e9
//         )}${path.extname(req.file.originalname || ".jpg")}`;

//       // 🟢 Detect environment
//       const isServerless = process.env.VERCEL || process.env.AWS_REGION;

//       if (!isServerless) {
//         // ✅ Local environment — save file to /uploads/sponsored
//         const uploadDir = path.join(__dirname, "../uploads/sponsored");
//         if (!fs.existsSync(uploadDir))
//           fs.mkdirSync(uploadDir, { recursive: true });

//         const filePath = path.join(uploadDir, filename);
//         fs.writeFileSync(filePath, req.file.buffer);

//         sponsoredImage = `/uploads/sponsored/${filename}`;
//       } else {
//         // 🚫 Serverless (Vercel/AWS) — can’t write to disk
//         // Instead, just simulate path or later replace this with Cloudinary/S3 upload
//         sponsoredImage = `/uploads/sponsored/${filename}`;
//         console.warn(
//           "⚠️ Running in serverless environment — skipping file save."
//         );
//       }
//     }

//     if (!sponsoredImage) {
//       return res.status(400).json({
//         success: false,
//         message: "Sponsored image is required.",
//       });
//     }

//     const sponsor = new sponsoredBy({ name, about, sponsoredImage });
//     await sponsor.save();

//     res.status(201).json({ success: true, sponsor });
//   } catch (err) {
//     console.error("Create Sponsor Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.getSponsoredById = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await sponsoredBy.findById(id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    res.status(200).json(sponsor);
  } catch (err) {
    console.error("Get Sponsor By ID Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update sponsor with image
exports.updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (req.file) updateData.sponsoredImage = req.file.path;
    const sponsor = await sponsoredBy.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
    res.status(200).json(sponsor);
  } catch (err) {
    console.error("Update Sponsor Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete sponsor
exports.deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await sponsoredBy.findByIdAndDelete(id);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
    res.status(200).json({ message: "Sponsor deleted successfully" });
  } catch (err) {
    console.error("Delete Sponsor Error:", err);
    res.status(500).json({ message: err.message });
  }
};
