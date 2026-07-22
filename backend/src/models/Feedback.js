import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    category: {
      type: String,
      default: "general",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    page: {
      type: String,
      default: "general",
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
