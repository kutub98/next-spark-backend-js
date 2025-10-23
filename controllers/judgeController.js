const Judge = require("../models/Judge");

// Create Judge Panel
const createJudgePanel = async (req, res) => {
  try {
    const judgePanel = await Judge.create(req.body);
    res.status(201).json({
      success: true,
      message: "Judge panel created successfully",
      data: judgePanel,
    });
  } catch (error) {
    console.error("Create judge panel error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create judge panel",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all Judge Panels
const getJudgePanels = async (req, res) => {
  try {
    const judgePanels = await Judge.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Judge panels fetched successfully",
      data: judgePanels,
    });
  } catch (error) {
    console.error("Get judge panels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch judge panels",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single Judge Panel
const getJudgePanelById = async (req, res) => {
  try {
    const { id } = req.params;

    const judgePanel = await Judge.findById(id);

    if (!judgePanel) {
      return res.status(404).json({
        success: false,
        message: "Judge panel not found",
      });
    }

    res.json({
      success: true,
      message: "Judge panel fetched successfully",
      data: judgePanel,
    });
  } catch (error) {
    console.error("Get judge panel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch judge panel",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Judge Panel
const updateJudgePanel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const judgePanel = await Judge.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!judgePanel) {
      return res.status(404).json({
        success: false,
        message: "Judge panel not found",
      });
    }

    res.json({
      success: true,
      message: "Judge panel updated successfully",
      data: judgePanel,
    });
  } catch (error) {
    console.error("Update judge panel error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update judge panel",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete Judge Panel
const deleteJudgePanel = async (req, res) => {
  try {
    const { id } = req.params;

    const judgePanel = await Judge.findByIdAndDelete(id);

    if (!judgePanel) {
      return res.status(404).json({
        success: false,
        message: "Judge panel not found",
      });
    }

    res.json({
      success: true,
      message: "Judge panel deleted successfully",
    });
  } catch (error) {
    console.error("Delete judge panel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete judge panel",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get judge panel by panel name
const getJudgePanelByPanel = async (req, res) => {
  try {
    const { panel } = req.params;

    const judgePanel = await Judge.findOne({ panel });

    if (!judgePanel) {
      return res.status(404).json({
        success: false,
        message: "Judge panel not found",
      });
    }

    res.json({
      success: true,
      message: "Judge panel fetched successfully",
      data: judgePanel,
    });
  } catch (error) {
    console.error("Get judge panel by panel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch judge panel",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createJudgePanel,
  getJudgePanels,
  getJudgePanelById,
  updateJudgePanel,
  deleteJudgePanel,
  getJudgePanelByPanel,
};
