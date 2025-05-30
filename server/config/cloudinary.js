// server/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary"; // Use v2 as cloudinary
import dotenv from "dotenv";

dotenv.config(); // Ensure dotenv is loaded here as well for config files

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
