// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";

// import passport from "passport";
// import "./config/Passport.js";
// import profileRoutes from "./routes/profileRoutes.js";
// import roadmapRoutes from "./routes/roadmap.js";
// import authRoutes from "./routes/authRoutes.js";
// import blogRoutes from "./routes/blog.routes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import programRoutes from "./routes/program.routes.js";
// import opportunityRoutes from "./routes/opportunity.routes.js";

// // ✅ STEP 1: create app FIRST
// const app = express();

// // ✅ STEP 2: create HTTP server
// const httpServer = createServer(app);

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:8000",
//   "https://skill-rise-india-kappa.vercel.app",
//   "https://skillrise-india-4.onrender.com"
// ];

// // ✅ STEP 3: create socket.io
// const io = new Server(httpServer, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"]
//   }
// });

// // Middleware
// app.use(express.json());
// app.use(cors());
// app.use(passport.initialize());

// // Routes
// app.use("/api/roadmap", roadmapRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/blogs", blogRoutes);
// app.use("/api/admin", adminRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("API Running");
// });

// // Socket connection
// io.on("connection", (socket) => {
//   console.log("Admin connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("Admin disconnected:", socket.id);
//   });
// });

// // Broadcast function
// export const broadcastStatsUpdate = () => {
//   io.emit("stats-update");
// };

// app.use("/api/programs", programRoutes);
// app.use("/api/opportunities", opportunityRoutes);
// app.use("/api/opportunity", opportunityRoutes); // Alias for POST convenience requested

// // Test route
// app.get("/", (req, res) => {
//   res.send("SkillRise API Running");
// });

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");

//     // ✅ IMPORTANT: use httpServer, NOT app.listen
//     httpServer.listen(process.env.PORT || 8000, () => {
//       console.log(`Server running on port ${process.env.PORT || 8000}`);
//     });

//   })
//   .catch((error) => {
//     console.error("MongoDB connection error:", error);
//   });

// export { io };

import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

import passport from "passport";
import "./config/Passport.js";
import profileRoutes from "./routes/profileRoutes.js";
import roadmapRoutes from "./routes/roadmap.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blog.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import programRoutes from "./routes/program.routes.js";
import opportunityRoutes from "./routes/opportunity.routes.js";
import persistenceRoutes from "./routes/persistenceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
const httpServer = createServer(app);

// ✅ UPDATED: Allow Vercel frontend and local dev ports
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:8000",
  "https://skill-rise-india-kappa.vercel.app",
  "https://skillrise-india-4.onrender.com",
  "https://skill-rise-2-0-8m4z.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  return /https:\/\/.*\.vercel\.app$/i.test(origin) || /http:\/\/localhost(:\d+)?$/i.test(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, 
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));
app.use(passport.initialize());

// Routes
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/opportunity", opportunityRoutes);
app.use("/api/persistence", persistenceRoutes);
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("SkillRise API Running ✅");
});

// Socket connection
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.id);
  });
});

// Broadcast function
export const broadcastStatsUpdate = () => {
  io.emit("stats-update");
};

// Auto-start resume analyzer microservice
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const analyzerPath = path.resolve(__dirname, "../../resume_analyser/backend");
const analyzer = spawn("node", ["src/server.js"], {
  cwd: analyzerPath,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PORT: "5001" }
});
analyzer.on("error", (err) => console.error("Resume analyzer failed to start:", err.message));
console.log("🔬 Resume analyzer service starting on port 5001...");

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT || 8000}`);
    });

  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

export { io };
