// middleware/auth.js
import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER:", req.headers.authorization);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
    
  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication error"
    });

  }
};