const sponsoredBy = require("../models/sponsoredBy");

// Get all sponsors
exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await sponsoredBy.find();
    res.status(200).json(sponsors);
  } catch (err) {
    console.error("Get Sponsors Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.createSponsor = async (req, res) => {
  try {
    const { name, about } = req.body;
    const sponsoredImage = req.file ? req.file.path : undefined; // match schema
    const sponsor = new sponsoredBy({ name, about, sponsoredImage });
    await sponsor.save();
    res.status(201).json(sponsor);
  } catch (err) {
    console.error("Create Sponsor Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get sponsor by ID
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
