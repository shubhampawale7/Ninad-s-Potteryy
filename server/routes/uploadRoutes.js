// server/routes/uploadRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import expressFileUpload from "express-fileupload"; // Import express-fileupload

const router = express.Router();

// Middleware to enable file uploads
router.use(
  expressFileUpload({
    useTempFiles: true, // Use temporary files to store uploaded files
    tempFileDir: "/tmp/", // Directory for temporary files
  })
);

// @desc    Upload product images to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files were uploaded." });
    }

    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];
    const uploadedImages = [];

    for (const file of files) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "ninads-pottery-products", // Folder in your Cloudinary account
        resource_type: "image", // Specify resource type
      });

      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    res.json(uploadedImages);
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
});

export default router;
