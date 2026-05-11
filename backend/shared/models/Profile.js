import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, //  one profile per user
  },

  role: {
    type: String,
    enum: ["student", "professional", "worker"],
  },

  data: {
    type: Object, // flexible (your formData)
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Profile", profileSchema);