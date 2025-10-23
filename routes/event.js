const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.get("/:id/participants", eventController.getEventParticipants);

// Protected routes
router.post("/", authenticate, requireAdmin, eventController.createEvent);
router.put("/:id", authenticate, requireAdmin, eventController.updateEvent);
router.patch("/:id", authenticate, requireAdmin, eventController.updateEvent);
router.delete("/:id", authenticate, requireAdmin, eventController.deleteEvent);
router.post("/add-participant", authenticate, eventController.addParticipant);

module.exports = router;
