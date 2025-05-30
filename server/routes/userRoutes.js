// server/routes/userRoutes.js (updated with admin routes)
import express from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
  getUsers, // Import new functions
  deleteUser, // Import new functions
  getUserById, // Import new functions
  updateUser, // Import new functions
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Import admin middleware
import {
  addOrRemoveWishlistItem,
  getWishlist,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", authUser);

// Private user-specific routes
router.get("/profile", protect, getUserProfile); // Get own profile

// Admin-specific user routes (require protect and admin middleware)
router.route("/").get(protect, admin, getUsers); // Get all users

router
  .route("/:id")
  .delete(protect, admin, deleteUser) // Delete a user
  .get(protect, admin, getUserById) // Get a user by ID
  .put(protect, admin, updateUser); // Update a user (e.g., change role)

router.route("/wishlist").get(protect, getWishlist);
router.route("/wishlist/:productId").put(protect, addOrRemoveWishlistItem);

export default router;
