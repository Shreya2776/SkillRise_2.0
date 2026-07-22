import RoadmapRecord from "../models/RoadmapRecord.js";
import { normalizeRoadmapPayload } from "../utils/persistenceHelpers.js";

export const saveRoadmap = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const normalized = normalizeRoadmapPayload(req.body);
    const record = await RoadmapRecord.create({
      user: req.user.id,
      ...normalized,
    });

    res.status(201).json({ success: true, record });
  } catch (error) {
    console.error("SAVE ROADMAP ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRoadmaps = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const roadmaps = await RoadmapRecord.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json({ success: true, roadmaps });
  } catch (error) {
    console.error("GET MY ROADMAPS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
