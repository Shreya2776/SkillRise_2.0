import express from "express";
import { generateRoadmap, updateRoadmap, careerSwitchRoadmap } from "../controllers/roadmapController.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/generate", generateRoadmap);
router.post("/update", upload.single("resume"), updateRoadmap);
router.post("/career-switch", upload.single("resume"), careerSwitchRoadmap);

export default router;