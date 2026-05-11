import { InterviewTemplate, InterviewSession } from "../models/Interview.js";
import { generateQuestions, evaluateInterview } from "../services/geminiService.js";
import fallbacks from "../utils/fallbacks.js";

/**
 * ⚡ CREATE INTERVIEW (Call #1)
 * Refactored to handle payload mismatches and provide detailed debugging.
 */
export const createInterviewSession = async (req, res, next) => {
  try {
    console.log("📥 Incoming Create Request:", JSON.stringify(req.body, null, 2));

    let { 
      role, 
      techStack, 
      techstack,
      difficulty, 
      track, 
      level,
      type,
      language: reqLanguage,
      questions: preGeneratedQuestions
    } = req.body;

    const interviewType = type || "technical";
    const language = reqLanguage || "English"; // 🌍 Default to English

    // 1. Pivot Frontend Fields -> Backend Schema
    techStack = techStack || techstack || track;
    difficulty = difficulty || level || "mid";

    // 🛡️ Data Normalization: Join Array to String for Mongoose
    if (Array.isArray(techStack)) {
      techStack = techStack.sort().join(", ");
    }
    
    // Failsafe for empty array conversions
    techStack = techStack || "General";

    // 2. Strict Validation Layer
    if (!role || !techStack || !difficulty) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Payload: 'role', 'techStack', and 'difficulty' are required strings." 
      });
    }

    const userId = req.user?.id || "6673f0000000000000000000";

    // 3. Caching Step
    let template = await InterviewTemplate.findOne({
      role: role.trim(),
      techStack,
      difficulty,
      language, // 🌍 Include language in cache key
    });

    if (!template) {
      console.log(`📡 [CACHE MISS] Generating questions for [${role}] via AI...`);
      try {
        const questions = preGeneratedQuestions?.length > 0
          ? preGeneratedQuestions
          : await generateQuestions(role, techStack, difficulty, interviewType, 5, language);
        template = await InterviewTemplate.create({
          role: role.trim(),
          techStack,
          difficulty,
          language, // 🌍 Save language in cache
          questions,
        });
      } catch (err) {
        console.warn("⚠️ AI Generation Failed. Using fallback bank.");
        const backup = fallbacks[role.toLowerCase()] || fallbacks.fullstack;
        template = { role, techStack, difficulty, questions: backup };
      }
    }

    // 4. Create Active Session
    const session = await InterviewSession.create({
      userId,
      role: template.role,
      difficulty: template.difficulty,
      techStack: template.techStack,
      language: template.language || language, // 🌍 Persist language
      questions: template.questions,
    });

    console.log(`✅ Session Created: ${session._id}`);
    res.status(201).json({ 
      success: true, 
      id: session._id, 
      interview: session,
      questions: session.questions 
    });

  } catch (error) {
    console.error("❌ Controller Error:", error);
    next(error);
  }
};

/**
 * ⚡ SUBMIT INTERVIEW (Call #2)
 */
export const submitInterviewSession = async (req, res, next) => {
  try {
    const { interviewId, answers } = req.body;
    console.log(`📥 Submission for session ${interviewId}...`);

    const session = await InterviewSession.findById(interviewId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview Session not found." });
    }

    const questionList = session.questions;
    const answerList = answers.map(a => a.answer || a.content || "");

    try {
      const evaluation = await evaluateInterview(session.role, questionList, answerList, session.language || "English");

      session.answers = answers;
      session.score = evaluation.score;
      session.feedback = evaluation;
      session.status = "completed";
      await session.save();

      res.json({ success: true, evaluation: session.feedback, score: session.score });
    } catch (err) {
      console.error("❌ Evaluation Failed. Saving as raw transcript.", err);
      session.answers = answers;
      session.status = "completed";
      session.score = 65;
      session.feedback = {
        strengths: ["Session completed successfully"],
        weaknesses: ["AI analysis was skipped due to throttle"],
        suggestions: ["Review your transcript manually."],
        finalAssessment: "AI evaluation reached quota. Raw performance recorded."
      };
      await session.save();
      res.json({ success: true, evaluation: session.feedback, score: session.score });
    }
  } catch (error) {
    next(error);
  }
};

export const generateFeedback = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview Session not found." });
    }

    const questionList = session.questions;
    
    // Extract only user responses from the voice agent transcript
    const answerList = session.transcript
      ?.filter(entry => entry.role === "user")
      .map(entry => entry.content || "") || [];

    try {
      const evaluation = await evaluateInterview(session.role, questionList, answerList, session.language || "English");

      session.score = evaluation.score;
      session.feedback = evaluation;
      session.status = "completed";
      
      // Map back to 'answers' structure for backwards-compatibility
      session.answers = questionList.map((q, i) => ({
        question: q,
        answer: answerList[i] || "Candidate provided no readable answer via voice."
      }));

      await session.save();
      res.json({ success: true, evaluation: session.feedback, score: session.score });
    } catch (err) {
      console.error("❌ Voice Transcript Evaluation Failed", err);
      session.status = "completed";
      session.score = 65;
      session.feedback = {
        strengths: ["Audio session completed"],
        weaknesses: ["AI analysis was skipped or dropped"],
        suggestions: ["Review transcript manually"],
        finalAssessment: "Voice evaluation failed or reached timeout. Minimal metrics recorded."
      };
      await session.save();
      res.json({ success: true, evaluation: session.feedback, score: session.score });
    }
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      InterviewSession.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InterviewSession.countDocuments({ userId: req.user.id })
    ]);

    res.json({ 
      success: true, 
      interviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    const interview = await InterviewSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    res.json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [total, completed, recent] = await Promise.all([
      InterviewSession.countDocuments({ userId }),
      InterviewSession.countDocuments({ userId, status: "completed" }),
      InterviewSession.find({ userId, status: "completed" }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      stats: { totalInterviews: total, completedInterviews: completed, recentInterviews: recent }
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const interview = await InterviewSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    res.json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (req, res, next) => {
  try {
    const result = await InterviewSession.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: "Interview not found" });
    res.json({ success: true, message: "Interview deleted" });
  } catch (error) {
    next(error);
  }
};
