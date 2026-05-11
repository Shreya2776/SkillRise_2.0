import express from "express";
import { getAdminStats, getUsersList, getNgosList } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getUsersList);
router.get("/ngos", getNgosList);

export default router;
