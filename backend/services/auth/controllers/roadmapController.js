import { buildRoadmapPrompt, buildUpdatePrompt, buildCareerSwitchPrompt } from "../services/promptBuilder.js";
import { generateRoadmapFromAI } from "../services/aiService.js";
import { formatRoadmap } from "../services/roadmapFormatter.js";
import { parseResume } from "../services/resumeParser.js";

export const generateRoadmap = async (req, res) => {
  console.log("📥 Received roadmap request");
  
  try {
    //NEW ADDED
    

    const {
      profile,
      resumeText,
      targetRole,
      duration,
      completedSteps,
      careerSwitch,
    } = req.body;

    if (!profile) {
      return res.status(400).json({ error: true, message: "Profile is required" });
    }
    console.log("🔨 Building prompt...");
    const prompt = buildRoadmapPrompt({
      profile,
      resumeText: profile.resume ,
      targetRole: profile.targetRole ,
      duration,
      completedSteps,
      careerSwitch,
    });

    console.log("🤖 Calling AI service...");
    const raw = await generateRoadmapFromAI(prompt);
    
    console.log("📋 Formatting response...");
    const formatted = formatRoadmap(raw);
    
    console.log("✅ Roadmap generated successfully");
    res.json(formatted);
    
  } catch (err) {
    console.error("❌ Roadmap generation error:", err.message);
    
    // Send the exact error message from LLM
    res.status(500).json({ 
      error: true,
      message: err.message,
      roadmap: [],
      details: err.stack
    });
  }
};

export const updateRoadmap = async (req, res) => {
  console.log("📥 Received roadmap update request");
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: "PDF file is required" });
    }

    const { targetRole, duration, completedSteps } = req.body;

    if (!targetRole || !duration) {
      return res.status(400).json({ error: true, message: "Target role and duration are required" });
    }

    console.log("📄 Parsing resume PDF...");
    const resumeText = await parseResume(req.file);

    console.log("🔨 Building update prompt...");
    const prompt = buildUpdatePrompt({
      profile: {},
      resumeText,
      targetRole,
      duration,
      completedSteps: JSON.parse(completedSteps || "[]"),
    });

    console.log("🤖 Calling AI service...");
    const raw = await generateRoadmapFromAI(prompt);
    
    console.log("📋 Formatting response...");
    const formatted = formatRoadmap(raw);
    
    console.log("✅ Roadmap updated successfully");
    res.json(formatted);
    
  } catch (err) {
    console.error("❌ Roadmap update error:", err.message);
    res.status(500).json({ 
      error: true,
      message: err.message,
      roadmap: []
    });
  }
};

export const careerSwitchRoadmap = async (req, res) => {
  console.log("📥 Received career switch roadmap request");
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: "PDF file is required" });
    }

    const { targetRole, duration, currentRole } = req.body;

    if (!targetRole || !duration) {
      return res.status(400).json({ error: true, message: "Target role and duration are required" });
    }

    console.log("📄 Parsing resume PDF...");
    const resumeText = await parseResume(req.file);

    console.log("🔨 Building career switch prompt...");
    const prompt = buildCareerSwitchPrompt({
      profile: {},
      resumeText,
      currentRole: currentRole || "Current Role",
      targetRole,
      duration,
    });

    console.log("🤖 Calling AI service...");
    const raw = await generateRoadmapFromAI(prompt);
    
    console.log("📋 Formatting response...");
    const formatted = formatRoadmap(raw);
    
    console.log("✅ Career switch roadmap generated successfully");
    res.json(formatted);
    
  } catch (err) {
    console.error("❌ Career switch roadmap error:", err.message);
    res.status(500).json({ 
      error: true,
      message: err.message,
      roadmap: []
    });
  }
};
