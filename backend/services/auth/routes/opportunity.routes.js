import express from "express";
import {
  createOpportunity,
  getOpportunities,
  getMyOpportunities,
  deleteOpportunity
} from "../controllers/opportunity.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getOpportunities);

// Protected NGO-only routes
router.post("/", protect, authorize("ngo"), createOpportunity);
router.get("/my", protect, authorize("ngo"), getMyOpportunities);
router.delete("/:id", protect, authorize("ngo"), deleteOpportunity);

export default router;
