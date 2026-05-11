import express from "express";
import { generateVapiToken, generateQuestions } from "../controllers/vapiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All Vapi routes are protected

// Fix the /token route to use the new generateVapiToken
router.post("/token", generateVapiToken);
router.post("/generate-questions", generateQuestions);

export default router;
