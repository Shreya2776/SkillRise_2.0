import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatThread",
    required: true,
    index: true
  },

  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },

  content: {
    type: String,
    required: true
  },

  embeddingId: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to quickly fetch messages inside a specific thread
ChatMessageSchema.index({ threadId: 1 });

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessage;
