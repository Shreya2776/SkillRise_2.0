import axios from "axios";
import { generateQuestions as callAiToGenerate } from "../services/geminiService.js";
import { InterviewTemplate } from "../models/Interview.js";
import fallbacks from "../utils/fallbacks.js";

/**
 * ⚡ GENERATE VAPI TOKEN (Secure Proxy Flow)
 * Refactored to catch 'value' as per user requirement. (Zero-Key exposure)
 */
export const generateVapiToken = async (req, res, next) => {
  try {
    const vapiKey = process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY;

    if (!vapiKey) {
      console.error("❌ VAPI_PRIVATE_KEY is missing in your .env configuration.");
      return res.status(500).json({ success: false, message: "Server misconfigured: Vapi Key missing." });
    }

    console.log("📡 Requesting session token from Vapi.ai API...");

    const response = await axios.post("https://api.vapi.ai/token", { tag: "public" }, {
      headers: {
        Authorization: `Bearer ${vapiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000 // 10s Token Handshake
    });

    console.log("📡 [VAPI DEBUG] Raw Token Response Data:", JSON.stringify(response.data, null, 2));

    // Fix: Using 'value' property from Vapi response if available (or fallback to 'token')
    const token = response.data.value || response.data.token;

    if (token) {
      console.log(`✅ Vapi Token Issued Successfully: [${token.slice(0, 8)}...]`);
      // Return: { token: value } as requested
      res.json({ success: true, token });
    } else {
      console.error("❌ Vapi API responded without a 'value' or 'token'.");
      res.status(500).json({ success: false, message: "Vapi response error: Missing token property." });
    }

  } catch (err) {
    console.error("❌ Vapi Authentication Failure:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: "Vapi Connection Refused or Unauthorized.",
      details: err.response?.data
    });
  }
};

/**
 * ⚡ GENERATE QUESTIONS FOR WIZARD
 */
export const generateQuestions = async (req, res, next) => {
  try {
    const { role, level, techstack, type = "technical", language = "English", amount = 10 } = req.body;

    // Normalize caching key
    const techString = (Array.isArray(techstack) ? techstack.sort().join(", ") : techstack) || "General";
    const cacheKey = `[${role}]-[${level}]-[${techString}]-[${language}]`.toLowerCase();

    // 1. Check template cache (role, level, techstack)
    let template = await InterviewTemplate.findOne({
      role: role.trim(),
      difficulty: level,
      techStack: techString,
      language, // 🌍 Cache by language
    });

    if (template) {
      console.log(`✅ [CACHE HIT] Question Bank found for ${cacheKey}. Zero AI hit required.`);
      return res.json({ success: true, questions: template.questions.slice(0, amount) });
    }

    // 2. Cache MISS: Generate via AI
    console.log(`❌ [CACHE MISS] ${cacheKey}`);
    console.log(`🧠 [AI PROMPT] role=${role}, skills=${techString}, level=${level}, type=${type}, count=${amount}`);

    try {
      const questions = await callAiToGenerate(role, techString, level, type, amount, language);

      console.log(`✅ [AI BRAIN] Success! Generated ${questions.length} questions.`);

      // Save for future reuse
      await InterviewTemplate.create({
        role: role.trim(),
        difficulty: level,
        techStack: techString,
        language, // 🌍 Persist language in cache
        questions,
      });

      res.json({ success: true, questions: questions.slice(0, amount) });
    } catch (aiErr) {
      console.warn("⚠️ [AI BRAIN] Generation Failed. Using static fallback database.");
      const backup = fallbacks[role.toLowerCase()] || fallbacks.fullstack;
      res.json({ success: true, questions: backup.slice(0, amount) });
    }

  } catch (error) {
    next(error);
  }
};
