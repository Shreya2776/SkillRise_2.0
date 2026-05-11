// ═══════════════════════════════════════════════════════════════════════════════
// User Memory Model — MongoDB Schema for Persistent User Intelligence
// ═══════════════════════════════════════════════════════════════════════════════
// Stores goals, inferred interests, skill focus areas, past recommendations,
// and interaction signals per user. Used by the memoryEngine to build
// personalization context that improves over time.

import mongoose from "mongoose";

const PastRecommendationSchema = new mongoose.Schema({
  type: { type: String, required: true },      // "course", "job", "scheme", "project"
  title: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const UserMemorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Explicit and inferred career goals
  goals: {
    type: [String],
    default: []
  },

  // Interest topic → weight (0.0–1.0). Higher = stronger recent interest.
  // Example: { "ai": 0.8, "web development": 0.5 }
  interests: {
    type: Map,
    of: Number,
    default: () => new Map()
  },

  // Skill focus topic → weight (0.0–1.0). Tracks which skills the user is actively pursuing.
  skillFocus: {
    type: Map,
    of: Number,
    default: () => new Map()
  },

  // History of recommendations already made to the user (avoids repetition)
  pastRecommendations: {
    type: [PastRecommendationSchema],
    default: []
  },

  // Aggregate interaction signals
  interactionSignals: {
    totalQueries: { type: Number, default: 0 },
    // Domain → count. Example: { "career": 5, "skills": 3 }
    domainCounts: {
      type: Map,
      of: Number,
      default: () => new Map()
    }
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// TTL index: auto-delete memories inactive for 180 days (optional safety net)
UserMemorySchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

const UserMemory = mongoose.models.UserMemory || mongoose.model("UserMemory", UserMemorySchema);

export default UserMemory;
