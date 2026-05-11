// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: String,
  phone: String,
  location: String,
  college: String,
  degree: String,
  year: String,
  interests: String,
  careerGoal: String,
  resumeUrl: String,
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);