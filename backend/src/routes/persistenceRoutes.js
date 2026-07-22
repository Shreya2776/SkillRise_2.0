import express from "express";
import { saveResumeAnalysis, getMyResumeAnalyses } from "../controllers/resumeAnalysisController.js";
import { saveRoadmap, getMyRoadmaps } from "../controllers/roadmapRecordController.js";
import { submitFeedback, getMyFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/resume-analysis", protect, saveResumeAnalysis);
router.get("/resume-analysis", protect, getMyResumeAnalyses);

router.post("/roadmaps", protect, saveRoadmap);
router.get("/roadmaps", protect, getMyRoadmaps);

router.post("/feedback", protect, submitFeedback);
router.get("/feedback", protect, getMyFeedback);

export default router;
