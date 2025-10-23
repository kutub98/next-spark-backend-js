const TimeInstruction = require("../models/TimeInstruction");

// Create Time Instruction
const createTimeInstruction = async (req, res) => {
  try {
    const timeInstruction = await TimeInstruction.create(req.body);
    res.status(201).json({
      success: true,
      message: "Time instruction created successfully",
      data: timeInstruction,
    });
  } catch (error) {
    console.error("Create time instruction error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create time instruction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all Time Instructions
const getTimeInstructions = async (req, res) => {
  try {
    const timeInstructions = await TimeInstruction.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      message: "Time instructions fetched successfully",
      data: timeInstructions,
    });
  } catch (error) {
    console.error("Get time instructions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time instructions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single Time Instruction
const getTimeInstructionById = async (req, res) => {
  try {
    const { id } = req.params;

    const timeInstruction = await TimeInstruction.findById(id);

    if (!timeInstruction) {
      return res.status(404).json({
        success: false,
        message: "Time instruction not found",
      });
    }

    res.json({
      success: true,
      message: "Time instruction fetched successfully",
      data: timeInstruction,
    });
  } catch (error) {
    console.error("Get time instruction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time instruction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Time Instruction
const updateTimeInstruction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const timeInstruction = await TimeInstruction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!timeInstruction) {
      return res.status(404).json({
        success: false,
        message: "Time instruction not found",
      });
    }

    res.json({
      success: true,
      message: "Time instruction updated successfully",
      data: timeInstruction,
    });
  } catch (error) {
    console.error("Update time instruction error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update time instruction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete Time Instruction
const deleteTimeInstruction = async (req, res) => {
  try {
    const { id } = req.params;

    const timeInstruction = await TimeInstruction.findByIdAndDelete(id);

    if (!timeInstruction) {
      return res.status(404).json({
        success: false,
        message: "Time instruction not found",
      });
    }

    res.json({
      success: true,
      message: "Time instruction deleted successfully",
    });
  } catch (error) {
    console.error("Delete time instruction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete time instruction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get latest time instruction (public endpoint)
const getLatestTimeInstruction = async (req, res) => {
  try {
    const timeInstruction = await TimeInstruction.findOne().sort({
      createdAt: -1,
    });

    if (!timeInstruction) {
      return res.status(404).json({
        success: false,
        message: "No time instruction found",
      });
    }

    res.json({
      success: true,
      message: "Latest time instruction fetched successfully",
      data: timeInstruction,
    });
  } catch (error) {
    console.error("Get latest time instruction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest time instruction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createTimeInstruction,
  getTimeInstructions,
  getTimeInstructionById,
  updateTimeInstruction,
  deleteTimeInstruction,
  getLatestTimeInstruction,
};
