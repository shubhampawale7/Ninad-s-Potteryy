// server/controllers/userController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js"; // We will create this next

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

export { registerUser, authUser, getUserProfile };
