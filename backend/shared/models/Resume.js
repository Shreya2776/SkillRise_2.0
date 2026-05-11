import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false // Optional if not logged in
    },
    resumeText: {
        type: String
    },
    content: {
        type: String // Mapping from chatbot
    },
    skills: [
        {
            type: String
        }
    ],
    experience: [{ type: Object }],
    education: [{ type: Object }],
    atsScore: {
        type: Number
    },
    suggestions: {
        type: String
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Resume", resumeSchema);
