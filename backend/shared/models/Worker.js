// models/Worker.js
import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: String,
  phone: String,
  location: String,
  language: String,
  skillType: String,
  experience: String,
  skills: String,
  tools: String,
  workType: String,
  radius: String,
  photo: String, // store URL (Cloudinary later)

}, { timestamps: true });

export default mongoose.model("Worker", workerSchema);