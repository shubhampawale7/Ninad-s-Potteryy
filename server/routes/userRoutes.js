// server/routes/userRoutes.js
import express from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", authUser);

// Private routes (requires authentication)
router.get("/profile", protect, getUserProfile); // 'protect' middleware will verify token

export default router;
