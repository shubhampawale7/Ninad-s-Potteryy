// server/models/Product.js
import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Link to the User who wrote the review
      required: true,
      ref: "User", // Reference the User model
    },
    name: {
      // User's name from User model (for display)
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // For review creation date
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      // User who created/added the product (e.g., admin)
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    images: [
      // Array of image URLs (Cloudinary integration later)
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    brand: {
      // Can be "Ninad's Pottery" or specific series
      type: String,
      required: true,
      default: "Ninad's Pottery", // Default brand
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema], // Array of review sub-documents
    rating: {
      // Overall average rating derived from reviews
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      // Total number of reviews
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // For product creation/update dates
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
