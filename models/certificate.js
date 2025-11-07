// const mongoose = require("mongoose");

// const certificateSchema = new mongoose.Schema(
//   {
//     imageUrl: { type: String, required: true },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     participation: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Participation",
//       required: true,
//     },
//     rank: String,
//     marks: Number,
//     totalMarks: Number,
//     signatures: [
//       {
//         name: String,
//         signature: String,
//         designation: String,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Certificate", certificateSchema);

const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participation", // Must match model name in participation.js
      required: true,
    },
    rank: String,
    marks: Number,
    totalMarks: Number,
    signatures: [
      {
        name: String,
        signature: String,
        designation: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
