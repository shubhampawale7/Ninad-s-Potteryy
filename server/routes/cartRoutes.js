// server/routes/cartRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // Assuming you have protect middleware
import {
  getCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
} from "../controllers/cartController.js"; // New controller functions

const router = express.Router();

router
  .route("/")
  .get(protect, getCart) // Get user's cart
  .post(protect, addToCart); // Add item to cart

router
  .route("/:id") // Using :id for product ID in the cart item
  .put(protect, updateCartItemQty) // Update item quantity
  .delete(protect, removeCartItem); // Remove item from cart

export default router;
