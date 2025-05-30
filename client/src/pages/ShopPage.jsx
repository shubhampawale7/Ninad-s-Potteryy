// client/src/pages/ShopPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import ProductCard from "../components/product/ProductCard";
import { MdSearch, MdSort, MdFilterList } from "react-icons/md";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useSelector } from "react-redux"; // Import useSelector to get user info

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");

  // Filter states
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sorting state
  const [sortBy, setSortBy] = useState("newest");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Wishlist state: stores IDs of products in the wishlist
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false); // New loading state for wishlist

  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  // Dummy categories
  const categories = [
    "All",
    "Vases",
    "Mugs",
    "Bowls",
    "Sculptures",
    "Plates",
    "Decor",
  ];

  // Function to fetch products (memoized with useCallback)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = [];
      if (searchTrigger) query.push(`keyword=${searchTrigger}`);
      if (category && category !== "All") query.push(`category=${category}`);
      if (minPrice) query.push(`minPrice=${minPrice}`);
      if (maxPrice) query.push(`maxPrice=${maxPrice}`);
      if (sortBy) query.push(`sortBy=${sortBy}`);
      if (page) query.push(`pageNumber=${page}`);

      const queryString = query.length > 0 ? `?${query.join("&")}` : "";
      // const url = `<span class="math-inline">\{import\.meta\.env\.VITE\_API\_BASE\_URL\}/api/products</span>{queryString}`; // Use VITE_API_BASE_URL
      const url = `http://localhost:5000/api/products${queryString}`; // Use this if not using VITE_API_BASE_URL env var

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProducts(data.products);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch products: ${err.message}`);
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTrigger, category, minPrice, maxPrice, sortBy, page]); // Dependencies for useCallback

  // Function to fetch user's wishlist
  const fetchWishlist = useCallback(async () => {
    if (!userInfo) {
      setWishlistProductIds(new Set()); // Clear wishlist if not logged in
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/wishlist`,
        {
          // const res = await fetch(`http://localhost:5000/api/users/wishlist`, { // Use this if not using VITE_API_BASE_URL env var
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Store only product IDs for quick lookup
      setWishlistProductIds(new Set(data.map((item) => item.product._id)));
    } catch (err) {
      toast.error(`Failed to fetch wishlist: ${err.message}`);
      console.error("Fetch wishlist error:", err);
      setWishlistProductIds(new Set());
    } finally {
      setWishlistLoading(false);
    }
  }, [userInfo]); // Dependency on userInfo for re-fetching on login/logout

  // Function to toggle product in wishlist
  const handleWishlistToggle = useCallback(
    async (productId) => {
      if (!userInfo) {
        toast.error("Please log in to manage your wishlist.");
        return;
      }

      try {
        // const res = await fetch(
        //   `<span class="math-inline">\{import\.meta\.env\.VITE\_API\_BASE\_URL\}/api/users/wishlist/</span>{productId}`,
        //   {
        const res = await fetch(
          `http://localhost:5000/api/users/wishlist/${productId}`,
          {
            // Use this if not using VITE_API_BASE_URL env var
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
        if (data.action === "added") {
          setWishlistProductIds((prev) => new Set(prev.add(productId)));
          toast.success("Product added to wishlist!");
        } else if (data.action === "removed") {
          setWishlistProductIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          toast.info("Product removed from wishlist.");
        }
      } catch (err) {
        toast.error(`Wishlist update failed: ${err.message}`);
        console.error("Wishlist toggle error:", err);
      }
    },
    [userInfo]
  ); // Dependency on userInfo

  // Effect to fetch products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Only re-run when fetchProducts changes (due to its own dependencies)

  // Effect to fetch wishlist when user info changes (login/logout)
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, userInfo]); // Re-run when fetchWishlist or userInfo changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTrigger(keyword);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  const handleSortChange = (e) => {
    setPage(1);
    setSortBy(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Framer Motion variants
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Shop Ninad's Pottery - Handcrafted Ceramics</title>
        <meta
          name="description"
          content="Browse and buy unique handcrafted pottery, ceramics, and home decor from Ninad's Pottery. Filter by category, price, and sort by relevance."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Our Pottery Collection
      </h1>

      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md mb-8 space-y-4 md:space-y-0 md:space-x-4">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-grow flex w-full md:w-auto"
        >
          <input
            type="text"
            placeholder="Search pottery..."
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <MdSearch className="text-2xl mr-1" /> Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <div className="relative">
            <label htmlFor="category" className="sr-only">
              Category
            </label>
            <select
              id="category"
              className="block w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                handleFilterChange();
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <MdFilterList className="text-2xl" />
            </div>
          </div>

          <div className="flex space-x-2">
            <label htmlFor="minPrice" className="sr-only">
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                handleFilterChange();
              }}
            />
            <label htmlFor="maxPrice" className="sr-only">
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                handleFilterChange();
              }}
            />
          </div>
        </div>

        {/* Sorting */}
        <div className="relative w-full md:w-auto">
          <label htmlFor="sortBy" className="sr-only">
            Sort By
          </label>
          <select
            id="sortBy"
            className="block w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="topRated">Top Rated</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <MdSort className="text-2xl" />
          </div>
        </div>
      </div>

      {loading || wishlistLoading ? ( // Show loading if either products or wishlist are loading
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">
            Loading products and wishlist...
          </p>
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto animate-spin"></div>
          <style>{` .loader { border-top-color: #3498db; } `}</style>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600 text-xl">
          <p>Error: {error}</p>
          <p>Please ensure the backend server is running and accessible.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-gray-600 text-xl">
          <p>No products found matching your criteria.</p>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={itemVariants}>
                <ProductCard
                  product={product}
                  // Check if product._id is in the set of wishlist product IDs
                  isWishlisted={wishlistProductIds.has(product._id)}
                  onWishlistToggle={handleWishlistToggle}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center mt-10 space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(pages).keys()].map((x) => (
                <button
                  key={x + 1}
                  onClick={() => handlePageChange(x + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    page === x + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {x + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ShopPage;
