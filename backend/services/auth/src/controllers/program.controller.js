import Program from "../models/program.model.js";

// @desc    Create a program (NGO only)
// @route   POST /api/programs
export const createProgram = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, message: "Only NGOs can create programs" });
    }

    const { title, description, type, skills, location, eligibility, deadline, contactInfo, applyLink } = req.body;

    if (!title || !type || !location) {
      return res.status(400).json({ success: false, message: "Title, type, and location are required" });
    }

    const program = await Program.create({
      title,
      description,
      type,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(sk => sk.trim()) : []),
      location,
      eligibility,
      deadline: deadline || undefined,
      contactInfo,
      applyLink,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, program });
  } catch (error) {
    console.error("CREATE PROGRAM ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all programs (public)
// @route   GET /api/programs
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate("createdBy", "name email")
      .sort("-createdAt");
    res.status(200).json({ success: true, programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get programs by the logged-in NGO
// @route   GET /api/programs/my
export const getProgramsByNgo = async (req, res) => {
  try {
    const programs = await Program.find({ createdBy: req.user.id }).sort("-createdAt");
    res.status(200).json({ success: true, programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete program (owner only)
// @route   DELETE /api/programs/:id
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    if (program.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this program" });
    }

    await program.deleteOne();
    res.status(200).json({ success: true, message: "Program removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
