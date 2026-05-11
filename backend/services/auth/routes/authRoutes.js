// routes/authRoutes.js
import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  createNgo
} from "../controllers/authController.js";
import { getRecommendations } from "../controllers/recommendationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/recommendations", protect, getRecommendations);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // On success, generate token and redirect to frontend with token/role
    const token = req.user.getSignedJwtToken();
    const role = req.user.role;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/login?token=${token}&role=${role}`);
  }
);

// Protected Admin-only routes
router.post("/create-ngo", protect, authorize("admin"), createNgo);

export default router;