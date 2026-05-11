import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import passport from "passport";
import morgan from "morgan";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Shared Configs
import connectDB from "./shared/config/database.js";
import "./shared/config/Passport.js";

// Service Routers - Auth
import profileRoutes from "./services/auth/routes/profileRoutes.js";
import roadmapRoutes from "./services/auth/routes/roadmap.js";
import authRoutes from "./services/auth/routes/authRoutes.js";
import blogRoutes from "./services/auth/routes/blog.routes.js";
import adminRoutes from "./services/auth/routes/adminRoutes.js";
import programRoutes from "./services/auth/routes/program.routes.js";
import opportunityRoutes from "./services/auth/routes/opportunity.routes.js";

// Service Routers - Resume
import analyzerRoutes from "./services/resume/routes/analyzerRoutes.js";

// Service Routers - Interview
import interviewRoutes from "./services/interview/routes/interviews.js";
import vapiRoutes from "./services/interview/routes/vapi.js";
import interviewAuthRoutes from "./services/interview/routes/auth.js"; // Alias to avoid conflict

// Service Routers - Chatbot (CommonJS)
const chatbotRoutes = require('./services/chatbot/routes/chatbot.routes.cjs');

const app = express();
const httpServer = createServer(app);

// Database Connection
connectDB();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "https://skill-rise-india-kappa.vercel.app",
  "https://skillrise-india-4.onrender.com",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true
}));

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(passport.initialize());

// --- Routes Mounting ---

// Auth Service
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/opportunities", opportunityRoutes);

// Resume Service
app.use("/api/resume", analyzerRoutes);

// Interview Service
app.use("/api/interview", interviewRoutes);
app.use("/api/interview/vapi", vapiRoutes);
app.use("/api/interview/auth", interviewAuthRoutes);

// Chatbot Service
app.use("/api/chatbot", chatbotRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    status: "SkillRise API Online",
    services: ["auth", "resume", "interview", "chatbot"] 
  });
});

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Export io for use in other services if needed
export { io };

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Consolidated Server running on port ${PORT}`);
});
