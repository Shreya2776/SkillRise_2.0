import express from "express";
import { 
  createInterviewSession, 
  submitInterviewSession, 
  getInterviews, 
  getInterview,
  getStats,
  updateInterview,
  deleteInterview,
  generateFeedback
} from "../controllers/interviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // Secure all production routes

// Refactored to match user specification
router.post("/create", createInterviewSession);
router.post("/submit", submitInterviewSession);
router.get("/", getInterviews);
router.get("/stats", getStats);
router.get("/:id", getInterview);
router.post("/:id/generate-feedback", generateFeedback);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

export default router;
