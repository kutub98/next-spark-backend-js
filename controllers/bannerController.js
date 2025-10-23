const Banner = require("../models/Banner");

// Create Banner
const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create banner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all Banners
const getBanners = async (req, res) => {
  try {
    const { status } = req.query;
    let query = Banner.find();

    // Filter by status if provided
    if (status) {
      query = query.where({ status });
    }

    const banners = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single Banner
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Get banner error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const banner = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update banner error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update banner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete Banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get approved banners (public endpoint)
const getApprovedBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ status: "approved" }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      message: "Approved banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    console.error("Get approved banners error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved banners",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  getApprovedBanners,
};
