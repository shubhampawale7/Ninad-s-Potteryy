// server/controllers/userController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "express-async-handler";
import Wishlist from "../models/Wishlist.js"; // Import the new Wishlist model
import Product from "../models/Product.js"; // Import Product model to validate product IDs

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      // 201 Created
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Generate JWT
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Generate JWT
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" }); // 401 Unauthorized
  }
};

// @desc    Get user profile (example of protected route)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // This req.user will be populated by our auth middleware later
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}); // Find all users
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("Cannot delete yourself");
    }
    await user.deleteOne(); // Use deleteOne() for Mongoose 6+
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password"); // Exclude password
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user (Admin only, e.g., role change)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    // Only admin can change role
    if (req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products.product",
    "name price image slug"
  ); // Populate product details

  if (wishlist) {
    res.json(wishlist.products);
  } else {
    res.json([]); // Return empty array if no wishlist exists for the user
  }
});

// @desc    Add or remove product from wishlist
// @route   PUT /api/users/wishlist/:productId
// @access  Private
const addOrRemoveWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    // Create a new wishlist if one doesn't exist for the user
    wishlist = new Wishlist({
      user: req.user._id,
      products: [{ product: productId }],
    });
    await wishlist.save();
    res
      .status(201)
      .json({ message: "Product added to wishlist", action: "added" });
  } else {
    const isProductInWishlist = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    if (isProductInWishlist) {
      // Remove product from wishlist
      wishlist.products = wishlist.products.filter(
        (item) => item.product.toString() !== productId
      );
      await wishlist.save();
      res.json({ message: "Product removed from wishlist", action: "removed" });
    } else {
      // Add product to wishlist
      wishlist.products.push({ product: productId });
      await wishlist.save();
      res
        .status(201)
        .json({ message: "Product added to wishlist", action: "added" });
    }
  }
});

export {
  registerUser,
  authUser,
  getUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getWishlist,
  addOrRemoveWishlistItem,
};
