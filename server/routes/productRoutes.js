// server/routes/productRoutes.js
import express from "express";
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);

router.route("/:id/reviews").post(protect, createProductReview); // Add review route

// Admin routes (require protect and admin middleware)
router.route("/").post(protect, admin, createProduct); // Create product
router
  .route("/:id")
  .delete(protect, admin, deleteProduct) // Delete product
  .put(protect, admin, updateProduct); // Update product

export default router;
