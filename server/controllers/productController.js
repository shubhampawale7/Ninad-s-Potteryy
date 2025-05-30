// server/controllers/productController.js
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler"; // For simplified error handling

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10; // Number of products per page (for future pagination)
  const page = Number(req.query.pageNumber) || 1; // Current page number

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i", // Case-insensitive
        },
      }
    : {};

  // New: Filtering by category
  const category = req.query.category ? { category: req.query.category } : {};

  // New: Filtering by brand
  const brand = req.query.brand ? { brand: req.query.brand } : {};

  // New: Price range filtering
  let priceFilter = {};
  if (req.query.minPrice || req.query.maxPrice) {
    priceFilter.price = {};
    if (req.query.minPrice) {
      priceFilter.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      priceFilter.price.$lte = Number(req.query.maxPrice);
    }
  }

  // New: Sorting options
  let sortOptions = {};
  if (req.query.sortBy === "price_asc") {
    sortOptions.price = 1; // Ascending
  } else if (req.query.sortBy === "price_desc") {
    sortOptions.price = -1; // Descending
  } else if (req.query.sortBy === "newest") {
    sortOptions.createdAt = -1; // Newest first
  } else if (req.query.sortBy === "top_rated") {
    sortOptions.rating = -1; // Highest rating first
  } else {
    sortOptions.createdAt = -1; // Default sort by newest
  }

  // Count total documents for pagination
  const count = await Product.countDocuments({
    ...keyword,
    ...category,
    ...brand,
    ...priceFilter,
  });

  // Find products with filters and apply sorting and pagination
  const products = await Product.find({
    ...keyword,
    ...category,
    ...brand,
    ...priceFilter,
  })
    .sort(sortOptions)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne(); // Use deleteOne()
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // Default product data for a new creation by admin
  // Admin will later update with real data from UI
  const product = new Product({
    name: "Sample Name",
    price: 0,
    user: req.user._id, // User who is creating (admin)
    images: [
      // Sample images (replace later with real upload functionality)
      { public_id: "sample_id_1", url: "/images/sample1.jpg" },
      { public_id: "sample_id_2", url: "/images/sample2.jpg" },
    ],
    brand: "Sample Brand",
    category: "Sample Category",
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
    rating: 0,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, images, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.images = images || product.images; // Expecting an array of {public_id, url}
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock =
      countInStock !== undefined ? countInStock : product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name, // Get name from authenticated user
      rating: Number(rating),
      comment,
      user: req.user._id, // Get user ID from authenticated user
    };

    product.reviews.push(review); // Add new review to reviews array

    product.numReviews = product.reviews.length; // Update total review count

    // Calculate new average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save(); // Save the updated product
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
};
