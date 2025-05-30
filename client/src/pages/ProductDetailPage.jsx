// client/src/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext"; // Import CartContext
import { MdStar, MdStarBorder, MdStarHalf } from "react-icons/md"; // For star ratings
import { Helmet } from "react-helmet-async"; // Import Helmet for SEO
// import { motion } from 'framer-motion'; // For future animations on page elements

function ProductDetailPage() {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const { state: authState } = useContext(AuthContext); // Get user info from AuthContext
  const { dispatch: cartDispatch } = useContext(CartContext); // Get cart dispatch

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1); // Quantity for adding to cart
  const [selectedImage, setSelectedImage] = useState(""); // For image gallery

  // Review state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false); // To prevent multiple reviews

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      setReviewSubmitted(false); // Reset review submitted status on product change
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].url); // Set default selected image
        }
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to fetch product: ${err.message}`);
        console.error("Fetch product error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, reviewSubmitted]); // Re-fetch when product ID changes OR when a review is submitted

  const addToCartHandler = () => {
    if (!authState.user) {
      toast.warning("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    if (product.countInStock === 0) {
      toast.error("Product is out of stock.");
      return;
    }

    // Dispatch the item to the cart
    cartDispatch({
      type: "CART_ADD_ITEM",
      payload: {
        product: product._id, // The unique ID of the product
        name: product.name,
        images: product.images, // Assuming images is an array of objects {public_id, url}
        price: product.price,
        countInStock: product.countInStock,
        qty, // Quantity selected by the user
      },
    });

    toast.success(`${qty} x ${product.name} added to cart!`);
    navigate("/cart"); // Navigate to the cart page after adding
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!authState.user) {
      toast.warning("You must be logged in to submit a review.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (comment.trim() === "") {
      toast.error("Please add a comment for your review.");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/products/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.user.token}`, // Send JWT
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // You might dispatch a specific action if you have one for review success
        // Example: dispatch({ type: 'PRODUCT_REVIEW_SUCCESS' });
        toast.success("Review submitted successfully!");
        setRating(0); // Reset form
        setComment(""); // Reset form
        setReviewSubmitted(true); // Trigger re-fetch of product data to update reviews section
      } else {
        setReviewError(data.message);
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      setReviewError(error.message);
      toast.error("Network error or server unavailable");
      console.error("Review submission error:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  // Helper to render stars (for display, not input)
  const renderStars = (avgRating) => {
    const fullStars = Math.floor(avgRating);
    const halfStar = avgRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <MdStar key={`full-${i}`} />
        ))}
        {halfStar && <MdStarHalf />}
        {[...Array(emptyStars)].map((_, i) => (
          <MdStarBorder key={`empty-${i}`} />
        ))}
      </div>
    );
  };

  // Helper for rating input
  const renderRatingInput = () => {
    return (
      <div className="flex items-center text-2xl mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`cursor-pointer ${
              rating >= star ? "text-yellow-500" : "text-gray-300"
            } hover:text-yellow-400 transition-colors duration-200`}
            onClick={() => setRating(star)}
          >
            <MdStar />
          </span>
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">Loading product details...</p>
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto animate-spin"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 text-xl">
        <p>Error: {error}</p>
        <p>Please ensure the backend server is running and accessible.</p>
      </div>
    );
  if (!product)
    return (
      <div className="text-center py-10 text-gray-600 text-xl">
        <p>Product not found.</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{product.name} - Ninad's Pottery</title>
        <meta
          name="description"
          content={product.description.substring(0, 160) + "..."}
        />{" "}
        {/* Truncate for meta */}
        {/* Open Graph / Social Media Tags */}
        <meta
          property="og:title"
          content={`${product.name} - Ninad's Pottery`}
        />
        <meta
          property="og:description"
          content={product.description.substring(0, 160) + "..."}
        />
        <meta
          property="og:image"
          content={
            product.images[0]?.url ||
            "https://yourwebsite.com/images/placeholder.jpg"
          }
        />{" "}
        {/* Replace with actual default image */}
        <meta
          property="og:url"
          content={`https://yourwebsite.com/product/${product._id}`}
        />{" "}
        {/* Replace with your actual domain */}
        <meta property="og:type" content="product" />
        {/* Schema.org for product rich snippets */}
        <script type="application/ld+json">
          {`
                        {
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": "${product.name}",
                            "image": "${
                              product.images[0]?.url ||
                              "https://yourwebsite.com/images/placeholder.jpg"
                            }",
                            "description": "${product.description
                              .replace(/"/g, '\\"')
                              .replace(/\n/g, "")}",
                            "brand": {
                                "@type": "Brand",
                                "name": "${product.brand}"
                            },
                            "offers": {
                                "@type": "Offer",
                                "url": "https://yourwebsite.com/product/${
                                  product._id
                                }",
                                "priceCurrency": "INR", // Assuming Indian Rupees for Razorpay
                                "price": "${product.price}",
                                "itemCondition": "https://schema.org/NewCondition",
                                "availability": "${
                                  product.countInStock > 0
                                    ? "https://schema.org/InStock"
                                    : "https://schema.org/OutOfStock"
                                }"
                            },
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "${product.rating}",
                                "reviewCount": "${product.numReviews}"
                            }
                        }
                    `}
        </script>
      </Helmet>

      <Link
        to="/shop"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        &larr; Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-lg">
        {/* Product Image Gallery */}
        <div>
          <img
            src={
              selectedImage ||
              product.images[0]?.url ||
              "/images/placeholder.jpg"
            }
            alt={product.name}
            className="w-full h-96 object-contain rounded-lg mb-4 border border-gray-200"
          />
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {product.images.map((img, index) => (
              <img
                key={img.public_id || index} // Use public_id if available, fallback to index
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                className={`w-20 h-20 object-cover object-center rounded-md cursor-pointer border-2 ${
                  selectedImage === img.url
                    ? "border-blue-600"
                    : "border-transparent"
                } hover:border-blue-500 transition-all duration-200`}
                onClick={() => setSelectedImage(img.url)}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {product.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">{product.brand}</p>
          <div className="flex items-center mb-4">
            {renderStars(product.rating)}
            <span className="text-gray-600 text-lg ml-2">
              ({product.numReviews} reviews)
            </span>
          </div>
          <p className="text-green-600 text-2xl font-bold mb-4">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="flex items-center mb-6">
            <span className="text-gray-700 font-semibold mr-4">Status:</span>
            <span
              className={`font-bold ${
                product.countInStock > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {product.countInStock > 0 && (
            <div className="flex items-center mb-6">
              <label htmlFor="qty" className="text-gray-700 font-semibold mr-4">
                Quantity:
              </label>
              <select
                id="qty"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              >
                {[...Array(product.countInStock).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>
                    {x + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={addToCartHandler}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.countInStock === 0}
          >
            {product.countInStock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Reviews ({product.numReviews})
        </h2>

        {product.reviews.length === 0 && (
          <p className="text-gray-600">No reviews yet.</p>
        )}

        {/* List of Reviews */}
        <div className="space-y-6 mb-8">
          {product.reviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-lg">{review.name}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              {renderStars(review.rating)}
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* Write a Review Section */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Write a Customer Review
        </h3>
        {reviewLoading && (
          <p className="text-blue-500 mb-4">Submitting review...</p>
        )}
        {reviewError && <p className="text-red-500 mb-4">{reviewError}</p>}
        {authState.user ? (
          // Check if the current user has already reviewed this product
          product.reviews.some(
            (r) =>
              r.user &&
              authState.user &&
              r.user.toString() === authState.user._id.toString()
          ) ? (
            <p className="text-green-600">
              You have already reviewed this product.
            </p>
          ) : (
            <form onSubmit={submitReviewHandler} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Rating
                </label>
                {renderRatingInput()}
              </div>
              <div>
                <label
                  htmlFor="comment"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={reviewLoading}
              >
                Submit Review
              </button>
            </form>
          )
        ) : (
          <p className="text-gray-600">
            Please{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              log in
            </Link>{" "}
            to write a review.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
