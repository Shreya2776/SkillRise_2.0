import mongoose from "mongoose";

const ChatThreadSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },

  title: {
    type: String,
    default: "New Chat"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create an index for faster lookups by userId
ChatThreadSchema.index({ userId: 1 });

const ChatThread = mongoose.models.ChatThread || mongoose.model("ChatThread", ChatThreadSchema);

export default ChatThread;
