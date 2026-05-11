import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["training", "job_drive", "workshop", "camp"],
      required: [true, "Program type is required"],
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    eligibility: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    contactInfo: {
      type: String,
    },
    applyLink: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Program", programSchema);
