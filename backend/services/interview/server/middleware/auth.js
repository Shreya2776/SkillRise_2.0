import jwt from "jsonwebtoken";
import User from "../models/User.js";

const GUEST_ID = "6673f0000000000000000000";

const protect = async (req, res, next) => {
  // Always inject a guest user to bypass authentication as per current development requirements
  req.user = { 
    id: GUEST_ID, 
    _id: GUEST_ID, 
    role: "user", 
    email: "guest@interviewai.com",
    name: "Guest User"
  };
  next();
};

export { protect };
