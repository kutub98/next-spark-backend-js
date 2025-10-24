const Offer = require("../models/Offer");

// Create Offer
const createOffer = async (req, res) => {
  console.log(req.body, "request body");
  try {
    const offer = await Offer.create(req.body);
    console.log("Offer created:", offer);
    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create offer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all Offers
const getOffers = async (req, res) => {
  try {
    const { status } = req.query;
    let query = Offer.find();

    // Filter by status if provided
    if (status) {
      query = query.where({ status });
    }

    const offers = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Offers fetched successfully",
      data: offers,
    });
  } catch (error) {
    console.error("Get offers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single Offer
const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      message: "Offer fetched successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Get offer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Offer
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const offer = await Offer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Update offer error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update offer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete Offer
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findByIdAndDelete(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get approved offers (public endpoint)
const getApprovedOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ status: "approved" }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      message: "Approved offers fetched successfully",
      data: offers,
    });
  } catch (error) {
    console.error("Get approved offers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved offers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  getApprovedOffers,
};
