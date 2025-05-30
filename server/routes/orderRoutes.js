// server/routes/orderRoutes.js
import express from "express";
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered, // Import new function
  getMyOrders,
  getOrders, // Import new function
  createRazorpayOrder,
  getRazorpayKey,
  verifyRazorpayPayment,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Import admin middleware

const router = express.Router();

// Publicly accessible for now (can be made private if needed later)
router.route("/config/razorpay").get(getRazorpayKey); // Get Razorpay Key ID

// User-specific order routes (require protection)
router
  .route("/")
  .post(protect, addOrderItems) // Create a new order
  .get(protect, admin, getOrders); // Admin: Get all orders

router.route("/myorders").get(protect, getMyOrders); // Get logged in user's orders

// Specific order ID routes (require protection)
router.route("/:id").get(protect, getOrderById); // Get single order details

router.route("/:id/pay").put(protect, updateOrderToPaid); // Mark order as paid

router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered); // Admin: Mark order as delivered

router.route("/:id/razorpay").post(protect, createRazorpayOrder); // Create a Razorpay order ID for payment

export default router;
