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

import passport from "passport";
import "./config/Passport.js";
import profileRoutes from "./routes/profileRoutes.js";
import roadmapRoutes from "./routes/roadmap.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blog.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import programRoutes from "./routes/program.routes.js";
import opportunityRoutes from "./routes/opportunity.routes.js";

const app = express();
const httpServer = createServer(app);

// ✅ UPDATED: Allow Vercel frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "https://skill-rise-india-kappa.vercel.app",
  "https://skillrise-india-4.onrender.com"
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, 
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
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
