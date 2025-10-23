const Event = require("../models/Event");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

// Create Event
const createEvent = async (req, res) => {
  try {
    // Add createdBy from authenticated user if available
    const eventData = {
      ...req.body,
    };

    if (req.user && req.user.userId) {
      eventData.createdBy = req.user.userId;
    }

    const event = await Event.create(eventData);
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all Events
const getEvents = async (req, res) => {
  try {
    const { status, populate } = req.query;
    let query = Event.find();

    // Filter by status if provided
    if (status) {
      query = query.where({ status });
    }

    // Populate quizzes if requested
    if (populate === "quizzes") {
      query = query.populate("quizzes");
    }

    const events = await query.sort({ startDate: 1 });

    res.json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single Event
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { populate } = req.query;

    let query = Event.findById(id);

    if (populate === "quizzes") {
      query = query.populate("quizzes");
    }

    const event = await query;

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add participant to event
const addParticipant = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    // Validate required fields
    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Event ID and User ID are required",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already a participant
    if (event.participants && event.participants.includes(userId)) {
      return res.json({
        success: true,
        message: "User is already a participant",
        data: event,
      });
    }

    // Add user to participants
    if (!event.participants) {
      event.participants = [];
    }
    event.participants.push(userId);
    event.currentParticipants = event.participants.length;

    await event.save();

    // Populate participants
    const populatedEvent = await Event.findById(eventId).populate(
      "participants",
      "fullNameEnglish fullNameBangla contact role"
    );

    res.json({
      success: true,
      message: "Participant added successfully",
      data: populatedEvent,
    });
  } catch (error) {
    console.error("Add participant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add participant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get event participants
const getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate(
      "participants",
      "fullNameEnglish fullNameBangla contact role"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event participants fetched successfully",
      data: {
        event: {
          _id: event._id,
          title: event.title,
          participants: event.participants,
          currentParticipants: event.currentParticipants,
        },
      },
    });
  } catch (error) {
    console.error("Get event participants error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event participants",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addParticipant,
  getEventParticipants,
};
