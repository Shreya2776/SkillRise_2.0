import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Verify token and attach user to request
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables");
    return res.status(500).json({ success: false, message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token ID:", decoded.id);

    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      console.log("User not found in DB with ID:", decoded.id);
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ success: false, message: `Not authorized, token failed: ${error.message}` });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || "unknown"}' is not authorized to access this route`
      });
    }
    next();
  };
};