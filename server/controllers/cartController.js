// server/controllers/cartController.js
import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js"; // To get product details and check stock

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image countInStock slug" // Populate necessary product details
  );

  if (cart) {
    res.json(cart);
  } else {
    // If no cart exists, return an empty cart structure
    res.json({ user: req.user._id, items: [], totalPrice: 0 });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;

  if (!productId || !qty || qty < 1) {
    res.status(400);
    throw new Error("Product ID and quantity (min 1) are required.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.countInStock < qty) {
    res.status(400);
    throw new Error(
      `Not enough stock for ${product.name}. Only ${product.countInStock} available.`
    );
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create a new cart if one doesn't exist for the user
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  // Check if item already exists in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // If item exists, update quantity
    const existingItem = cart.items[itemIndex];
    const newQty = existingItem.qty + qty;

    if (product.countInStock < newQty) {
      res.status(400);
      throw new Error(
        `Cannot add more. Total quantity for ${product.name} would exceed stock of ${product.countInStock}.`
      );
    }
    existingItem.qty = newQty;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      qty: qty,
    });
  }

  await cart.save();
  res.status(200).json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItemQty = asyncHandler(async (req, res) => {
  const { id: productId } = req.params; // Product ID from URL params
  const { qty } = req.body;

  if (!qty || qty < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new new Error("Product not found.")();
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found for this user.");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    const existingItem = cart.items[itemIndex];

    if (qty > product.countInStock) {
      res.status(400);
      throw new Error(
        `Cannot set quantity to ${qty}. Only ${product.countInStock} available for ${product.name}.`
      );
    }

    existingItem.qty = qty;
    await cart.save();
    res.json(cart);
  } else {
    res.status(404);
    throw new Error("Product not found in cart.");
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const { id: productId } = req.params; // Product ID from URL params

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found for this user.");
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  if (cart.items.length === initialLength) {
    res.status(404);
    throw new Error("Product not found in cart to remove.");
  }

  await cart.save();
  res.json({ message: "Item removed from cart", cart });
});

export { getCart, addToCart, updateCartItemQty, removeCartItem };
