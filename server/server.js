// server/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"; // Import user routes

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Allows parsing JSON body
app.use(cors()); // Enable CORS

// Basic test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Use User Routes
app.use("/api/users", userRoutes); // All user related routes start with /api/users

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
