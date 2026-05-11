import Opportunity from "../models/opportunity.model.js";

// @desc    Create an opportunity (NGO only)
// @route   POST /api/opportunities
export const createOpportunity = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, message: "Only NGOs can create opportunities" });
    }

    const { title, description, type, skills, tags, location, deadline, contactInfo, applyLink } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ success: false, message: "Title, description, and type are required" });
    }

    const opp = await Opportunity.create({
      title,
      description,
      type,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(sk => sk.trim()) : []),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
      location,
      deadline: deadline || undefined,
      contactInfo,
      applyLink,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, opportunity: opp });
  } catch (error) {
    console.error("CREATE OPPORTUNITY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all latest opportunities (public)
// @route   GET /api/opportunities
export const getOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("createdBy", "name email")
      .sort("-createdAt")
      .limit(50)
      .lean();

    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error("GET OPPORTUNITIES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get opportunities created by current NGO
// @route   GET /api/opportunities/my
export const getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ createdBy: req.user.id })
      .sort("-createdAt")
      .lean();
    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error("GET MY OPPORTUNITIES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete opportunity (owner only)
// @route   DELETE /api/opportunities/:id
export const deleteOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: "Not found" });
    
    if (opp.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await opp.deleteOne();
    res.status(200).json({ success: true, message: "Opportunity deleted" });
  } catch (error) {
    console.error("DELETE OPPORTUNITY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
