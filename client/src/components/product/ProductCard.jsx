// client/src/components/product/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa"; // Import FaShoppingCart
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux"; // Import useDispatch
import { addToCart } from "../../features/cart/cartSlice"; // Import addToCart thunk
import { useContext } from "react"; // Import useContext for AuthContext
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext

function ProductCard({ product, isWishlisted, onWishlistToggle }) {
  const dispatch = useDispatch();
  const { state: authState } = useContext(AuthContext); // Get user info from AuthContext

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authState.user || !authState.user.token) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    if (product.countInStock === 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        qty: 1, // Default to 1 from product card
        token: authState.user.token,
      })
    );
  };

  return (
    <motion.div
      className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full"
      whileHover={{ y: -5 }}
    >
      <Link to={`/product/${product.slug}`} className="block h-full">
        {/* Wishlist Icon */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-colors duration-200"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500 text-xl" />
          ) : (
            <FaRegHeart className="text-gray-500 hover:text-red-500 text-xl" />
          )}
        </button>

        <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden flex items-center justify-center bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/placeholder.jpg";
            }}
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 capitalize">
            {product.category}
          </p>
          <div className="flex items-center mb-3">
            <div className="text-yellow-500 mr-1">
              {Array(Math.floor(product.rating)).fill("★")}
              {product.rating % 1 !== 0 && "½"}
            </div>
            <span className="text-gray-600 text-sm">
              ({product.numReviews} reviews)
            </span>
          </div>
          <div className="mt-auto flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">
              ${product.price.toFixed(2)}
            </span>
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className={`flex items-center py-2 px-4 rounded-md transition-colors duration-200 text-sm
                                ${
                                  product.countInStock === 0
                                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
            >
              <FaShoppingCart className="mr-2" />
              {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductCard;
