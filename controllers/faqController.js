const Faq = require("../models/Faq");

// Create FAQ
const createFaq = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Create FAQ error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create FAQ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all FAQs
const getFaqs = async (req, res) => {
  try {
    const { status } = req.query;
    let query = Faq.find();

    // Filter by status if provided
    if (status) {
      query = query.where({ status });
    }

    const faqs = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "FAQs fetched successfully",
      data: faqs,
    });
  } catch (error) {
    console.error("Get FAQs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single FAQ
const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ fetched successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Get FAQ error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update FAQ
const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const faq = await Faq.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Update FAQ error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update FAQ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get approved FAQs (public endpoint)
const getApprovedFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ status: "approved" }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Approved FAQs fetched successfully",
      data: faqs,
    });
  } catch (error) {
    console.error("Get approved FAQs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved FAQs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get latest FAQ (public endpoint)
const getLatestFaq = async (req, res) => {
  try {
    const faq = await Faq.findOne({ status: "approved" }).sort({
      createdAt: -1,
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "No approved FAQ found",
      });
    }

    res.json({
      success: true,
      message: "Latest FAQ fetched successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Get latest FAQ error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest FAQ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createFaq,
  getFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
  getApprovedFaqs,
  getLatestFaq,
};
