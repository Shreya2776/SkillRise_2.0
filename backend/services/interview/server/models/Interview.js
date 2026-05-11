import mongoose from "mongoose";

/**
 * InterviewTemplate: Caches questions generated for specific configurations
 * Ensures we don't call Gemini for the SAME role/tech/difficulty twice.
 */
const templateSchema = new mongoose.Schema({
  role: { type: String, required: true },
  techStack: { type: String, required: true },
  difficulty: { type: String, required: true },
  language: { type: String, default: "English" }, // 🌍 Multilingual support
  questions: [String],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

templateSchema.index({ role: 1, techStack: 1, difficulty: 1, language: 1 }, { unique: true });

/**
 * SessionSchema: Tracks a specific user's attempt at an interview
 */
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true },
  difficulty: { type: String, required: true },
  techStack: { type: String },
  language: { type: String, default: "English" }, // 🌍 Track session language
  questions: [String],
  answers: [
    {
      question: String,
      answer: String,
    }
  ],
  transcript: [
    {
      role: String,
      content: String,
    }
  ],
  duration: Number,
  score: { type: Number },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    questionFeedback: [
      {
        question: String,
        rating: Number,
        comment: String,
      }
    ],
    finalAssessment: String,
  },
  status: { type: String, enum: ["in-progress", "completed", "expired"], default: "in-progress" },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const InterviewTemplate = mongoose.model("InterviewTemplate", templateSchema);
const InterviewSession = mongoose.model("InterviewSession", sessionSchema);

export { InterviewTemplate, InterviewSession };
