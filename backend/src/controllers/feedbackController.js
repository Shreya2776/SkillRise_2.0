import Feedback from "../models/Feedback.js";
import { normalizeFeedbackPayload } from "../utils/persistenceHelpers.js";

export const submitFeedback = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const normalized = normalizeFeedbackPayload(req.body);
    if (!normalized.message) {
      return res.status(400).json({ success: false, message: "Feedback message is required" });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      ...normalized,
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error("SUBMIT FEEDBACK ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const feedback = await Feedback.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("GET MY FEEDBACK ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
