import mongoose from "mongoose";

const roadmapRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["generate", "update", "career-switch"],
      default: "generate",
    },
    roadmap: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    targetRole: String,
    duration: String,
    completedSteps: [{ type: String, trim: true }],
    summary: String,
    profileData: {
      type: Object,
      default: {},
    },
    rawResponse: {
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

export default mongoose.model("RoadmapRecord", roadmapRecordSchema);
