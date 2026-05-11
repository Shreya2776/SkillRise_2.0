import express from "express";
import {
  createProgram,
  getAllPrograms,
  getProgramsByNgo,
  deleteProgram
} from "../controllers/program.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route — any user can view all programs
router.get("/", getAllPrograms);

// Protected NGO-only routes
router.post("/", protect, authorize("ngo"), createProgram);
router.get("/my", protect, authorize("ngo"), getProgramsByNgo);
router.delete("/:id", protect, authorize("ngo"), deleteProgram);

export default router;
