import express from "express";
import {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  generateBlog,
  getFeed,
  interactBlog,
  updateBlog,
  deleteBlog
} from "../controllers/blog.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route — any user can view all blogs
router.get("/", getAllBlogs);

// Protected routes (any logged in user)
router.get("/feed", protect, getFeed);
router.post("/:id/interact", protect, interactBlog);

// Protected NGO-only routes
router.post("/generate", protect, authorize("ngo"), generateBlog);
router.post("/", protect, authorize("ngo"), createBlog);
router.get("/my", protect, authorize("ngo"), getMyBlogs);
router.put("/:id", protect, authorize("ngo"), updateBlog);
router.delete("/:id", protect, authorize("ngo"), deleteBlog);

export default router;
