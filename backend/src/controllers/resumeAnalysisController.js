import ResumeAnalysis from "../models/ResumeAnalysis.js";
import { normalizeResumePayload } from "../utils/persistenceHelpers.js";

export const saveResumeAnalysis = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const normalized = normalizeResumePayload(req.body);
    const analysis = await ResumeAnalysis.create({
      user: req.user.id,
      ...normalized,
    });

    res.status(201).json({ success: true, analysis });
  } catch (error) {
    console.error("SAVE RESUME ANALYSIS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyResumeAnalyses = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const analyses = await ResumeAnalysis.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json({ success: true, analyses });
  } catch (error) {
    console.error("GET RESUME ANALYSES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
