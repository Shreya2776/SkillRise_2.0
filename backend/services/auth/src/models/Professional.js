// models/Professional.js
import mongoose from "mongoose";

const professionalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: String,
  phone: String,
  location: String,
  language: String,
  role: String,
  experience: String,
  company: String,
  skills: String,
  salary: String,
  careerGoal: String,
  resumeUrl: String,
}, { timestamps: true });

export default mongoose.model("Professional", professionalSchema);