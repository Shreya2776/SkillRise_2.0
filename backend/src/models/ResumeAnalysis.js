import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Resume Analysis",
    },
    source: {
      type: String,
      enum: ["upload", "manual", "generated"],
      default: "upload",
    },
    skills: [{ type: String, trim: true }],
    score: {
      type: Number,
      default: 0,
    },
    suggestions: {
      type: String,
      default: "",
    },
    rawData: {
      type: Object,
      default: {},
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
