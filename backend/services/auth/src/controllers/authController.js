// controllers/authController.js
import User from "../models/user.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { saveOtp } from "../utils/otpStore.js";
import { verifyOtpStore } from "../utils/otpStore.js";
import { markVerified, isVerified } from "../utils/otpStore.js";

// REGISTER USER (Only normal users can register themselves)
export const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    email = email.toLowerCase();
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    if (!isVerified(email)) {
      return res.status(400).json({ success: false, message: "Please verify OTP first" });
    }

    // Role is defaulted to "user" in the model, so we don't need to explicitly set it.
    // However, for security, we explicitly don't allow setting the role in public registration.
    const user = await User.create({
      name,
      email,
      password,
      isVerified: true,
      role: "user" // Force user role for public registration
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGIN USER (Single login for all roles)
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN CREATE NGO ACCOUNT
export const createNgo = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const emailLower = email.toLowerCase();
    const userExists = await User.findOne({ email: emailLower });

    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email: emailLower,
      password,
      role: "ngo",
      isVerified: true // Pre-verified by admin
    });

    res.status(201).json({
      success: true,
      message: "NGO account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("CREATE NGO ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// OTP Functions (already existing but kept for completeness)
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let user = await User.findOne({ email });

    if (user) {
      user.otp = otp;
      user.otpExpire = Date.now() + 10 * 60 * 1000;
      await user.save();
    } else {
      saveOtp(email, otp);
    }

    await sendEmail(email, "OTP Verification", `Your OTP is ${otp}`);

    res.json({ success: true, message: "OTP sent" });
    console.log("OTP SENT TO:", email, " - ", otp);

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.toLowerCase();
    otp = String(otp);

    let user = await User.findOne({ email });

    if (user) {
      if (user.otp !== otp || user.otpExpire < Date.now()) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save();
      return res.json({ success: true, message: "OTP verified" });
    }

    const isValid = verifyOtpStore(email, otp);
    if (!isValid) return res.status(400).json({ success: false, message: "Invalid OTP" });

    markVerified(email);
    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(email, "Reset Password OTP", `OTP: ${otp}`);
  res.json({ success: true, message: "Reset OTP sent" });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
};