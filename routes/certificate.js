// const express = require("express");
// const { createCertificate } = require("../controllers/certificateController");
// const router = express.Router();

// router.post("/", createCertificate);

// module.exports = router;

const express = require("express");
const {
  createCertificate,
  getCertificates,
  getCertificatesByUser,
  getCertificateByParticipation,
} = require("../controllers/certificateController");

const router = express.Router();

// POST → create new certificate
router.post("/", createCertificate);

// GET → get all certificates
router.get("/", getCertificates);

// GET → get certificates for a user
router.get("/user/:userId", getCertificatesByUser);

// GET → get certificate by participation ID
router.get("/participation/:participationId", getCertificateByParticipation);

module.exports = router;
