import Blog from "../models/blog.model.js";
import Profile from "../models/Profile.js";

// @desc    Create a blog (NGO only)
// @route   POST /api/blogs
export const createBlog = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, message: "Only NGOs can create blogs" });
    }

    const { title, description, skills, tags, location, region } = req.body;

    if (!title || !description || !skills) {
      return res.status(400).json({ success: false, message: "Title, description, and skills are required" });
    }

    const blog = await Blog.create({
      title,
      description,
      skills: Array.isArray(skills) ? skills : skills.split(",").map(sk => sk.trim()),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
      location,
      region: region || location,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    console.error("CREATE BLOG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all blogs (public)
// @route   GET /api/blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("createdBy", "name email")
      .sort("-createdAt");
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blogs of the logged-in NGO
// @route   GET /api/blogs/my
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user.id }).sort("-createdAt");
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
export const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Check ownership
    if (blog.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this blog" });
    }

    const { title, description, skills, tags, location, region } = req.body;
    
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        skills: Array.isArray(skills) ? skills : skills.split(",").map(sk => sk.trim()),
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
        location,
        region: region || location
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Check ownership
    if (blog.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this blog" });
    }

    await blog.deleteOne();
    res.status(200).json({ success: true, message: "Blog removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get personalized blog feed
// @route   GET /api/blogs/feed
export const getFeed = async (req, res) => {
  try {
    const userId = req.user?.id;
    let userSkills = [];
    let userInterests = [];
    let userRole = "";

    if (userId) {
      const profile = await Profile.findOne({ user: userId }).lean();
      if (profile) {
        userSkills = profile.data?.skills || [];
        userInterests = profile.data?.interests || [];
        userRole = profile.role || "";
      }
    }

    // Fetch published blogs (using lean for performance)
    const blogs = await Blog.find()
      .populate("createdBy", "name email")
      .sort("-createdAt")
      .limit(100)
      .lean();

    const currentDate = new Date();

    // Calculate score for each blog
    const scoredBlogs = blogs.map(blog => {
      let score = 0;

      // 1. Skill match (+5 per match)
      const blogSkills = blog.skills || [];
      const skillMatches = blogSkills.filter(sk => userSkills.includes(sk));
      score += skillMatches.length * 5;

      // 2. Tag/interest match (+3 per match)
      const blogTags = blog.tags || [];
      const tagMatches = blogTags.filter(tag => userInterests.includes(tag));
      score += tagMatches.length * 3;

      // 3. Role match (+2)
      if (userRole && blogTags.includes(userRole)) {
        score += 2;
      }

      // 4. Popularity boost
      const likes = blog.likes || 0;
      const views = blog.views || 0;
      score += (likes * 0.2) + (views * 0.05);

      // 5. Time decay 
      // Current formula: gets up to 5 points if brand new, decaying over time
      const daysOld = (currentDate - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24);
      const timeBoost = Math.max(0, 5 - (daysOld * 0.16));
      score += timeBoost;

      return { ...blog, feedScore: score };
    });

    // Strategy 1: Personalized (Sort by score DESC, limited to top 20)
    const personalized = [...scoredBlogs]
      .sort((a, b) => b.feedScore - a.feedScore)
      .slice(0, 20);

    // Strategy 2: Trending (Sort heavily by likes & views)
    const trending = [...scoredBlogs]
      .sort((a, b) => (((b.likes || 0) * 2) + (b.views || 0)) - (((a.likes || 0) * 2) + (a.views || 0)))
      .slice(0, 10);

    // Strategy 3: Explore (Random shuffle for discovery)
    const explore = [...scoredBlogs]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    res.status(200).json({
      success: true,
      personalized,
      trending,
      explore
    });
  } catch (error) {
    console.error("GET FEED ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Basic interaction tracking (like / view)
// @route   POST /api/blogs/:id/interact
export const interactBlog = async (req, res) => {
  try {
    const { type } = req.body; // 'view' or 'like'
    const update = type === "like" ? { $inc: { likes: 1 } } : { $inc: { views: 1 } };
    
    await Blog.findByIdAndUpdate(req.params.id, update);
    res.status(200).json({ success: true, message: `Blog ${type} recorded` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { generateBlogContent } from "../services/blogGenerator.js";

// @desc    Generate a blog using AI
// @route   POST /api/blogs/generate
export const generateBlog = async (req, res) => {
  try {
    const { topic, details } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: "A topic is required for AI generation" });
    }

    const generatedData = await generateBlogContent(topic, details);

    res.status(200).json({
      success: true,
      data: generatedData
    });

  } catch (error) {
    console.error("AI Generation Route Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate blog: " + error.message });
  }
};
