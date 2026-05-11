import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Local imports MUST include .js in ESM
import connectDB from "./config/db.js";
import errorHandler from "./middleware/error.js";

// Route imports
import authRoutes from "./routes/auth.js";
import interviewRoutes from "./routes/interviews.js";
import vapiRoutes from "./routes/vapi.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(json({ limit: "10mb" }));
app.use(morgan("dev"));

// Rate limiting (High limit for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
app.use("/api/", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/vapi", vapiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "API Online", engine: "Gemma-3-4B" });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5050;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("VAPI KEY:", process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log("✅ Vapi Secure Proxy Active");
});
