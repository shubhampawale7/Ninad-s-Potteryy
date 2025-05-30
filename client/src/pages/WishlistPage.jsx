// client/src/pages/WishlistPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { FaHeartBroken } from "react-icons/fa"; // Icon for empty wishlist

// You might want to reuse ProductCard, but for simplicity, let's display details directly for now
// Or you can import ProductCard if it suits the layout of your WishlistPage
import ProductCard from "../components/product/ProductCard"; // Reusing ProductCard for consistency
import { motion } from "framer-motion";

function WishlistPage() {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This function should be similar to the one in ShopPage
  // In a larger app, you might abstract this into a custom hook or Redux Thunk
  const fetchWishlist = useCallback(async () => {
    if (!userInfo) {
      // If not logged in, redirect to login or show a message
      toast.error("Please log in to view your wishlist.");
      navigate("/login"); // Redirect to login page
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Failed to fetch wishlist: ${res.status}`
        );
      }

      const data = await res.json();
      setWishlistItems(data); // data will be an array of { product: {...}, addedAt: ... }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error("Fetch wishlist error:", err);
    } finally {
      setLoading(false);
    }
  }, [userInfo, navigate]); // Depend on userInfo and navigate

  // Function to toggle product in wishlist (remove from this page)
  const handleWishlistToggle = useCallback(
    async (productId) => {
      if (!userInfo) {
        toast.error("Please log in to manage your wishlist.");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/users/wishlist/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${res.status}`
          );
        }

        const data = await res.json();
        if (data.action === "removed") {
          // Update local state by filtering out the removed product
          setWishlistItems((prevItems) =>
            prevItems.filter((item) => item.product._id !== productId)
          );
          toast.info("Product removed from wishlist.");
        }
        // No 'added' case here, as this page is for viewing existing wishlist
      } catch (err) {
        toast.error(`Wishlist update failed: ${err.message}`);
        console.error("Wishlist toggle error:", err);
      }
    },
    [userInfo]
  );

  // Fetch wishlist on component mount or userInfo change
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Framer Motion variants for product grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-600">Loading wishlist...</p>
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto animate-spin"></div>
        <style>{` .loader { border-top-color: #3498db; } `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600 text-xl">
        <p>Error: {error}</p>
        <p>Please try again later or ensure you are logged in.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>My Wishlist - Ninad's Pottery</title>
        <meta
          name="description"
          content="View and manage your saved pottery and ceramics in your personal wishlist."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-10 text-gray-600 text-xl">
          <FaHeartBroken className="text-6xl mx-auto mb-4 text-gray-400" />
          <p>Your wishlist is empty.</p>
          <p className="mt-2">
            Start adding items from our{" "}
            <Link to="/shop" className="text-blue-600 hover:underline">
              shop page
            </Link>
            !
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {wishlistItems.map((item) => (
            <motion.div key={item.product._id} variants={itemVariants}>
              <ProductCard
                product={item.product}
                isWishlisted={true} // Always true on wishlist page
                onWishlistToggle={handleWishlistToggle} // Allow removal
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default WishlistPage;
