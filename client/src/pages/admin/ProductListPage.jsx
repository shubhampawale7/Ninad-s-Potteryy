// client/src/pages/admin/ProductListPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";
import { MdEdit, MdDelete, MdAdd, MdDownload } from "react-icons/md"; // Added MdDownload icon for potential future use
import { motion } from "framer-motion"; // Import motion for animations
import { Helmet } from "react-helmet-async"; // Import Helmet for SEO

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false); // For delete operation
  const [createLoading, setCreateLoading] = useState(false); // For create operation

  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if user is admin, if not, redirect
  useEffect(() => {
    if (!authState.user || authState.user.role !== "admin") {
      navigate("/login"); // Or home, depends on preference
      toast.error("Unauthorized access. Admin privileges required.");
    }
  }, [authState.user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Admin token needed for some product list features later (e.g., drafts, hidden products)
      // Even for public products, it's often good practice to send token for admin routes
      const res = await fetch("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${authState.user.token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch products: ${err.message}`);
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user && authState.user.role === "admin") {
      fetchProducts();
    }
  }, [authState.user]); // Re-fetch when user state changes (e.g., login/logout)

  const deleteHandler = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      setDeleteLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authState.user.token}`,
          },
        });

        if (res.ok) {
          toast.success("Product deleted successfully!");
          fetchProducts(); // Re-fetch products after deletion
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to delete product");
        }
      } catch (error) {
        toast.error("Network error or server unavailable");
        console.error("Delete product error:", error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const createProductHandler = async () => {
    if (
      window.confirm(
        "Are you sure you want to create a new sample product? You can edit its details later."
      )
    ) {
      setCreateLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.user.token}`,
          },
          body: JSON.stringify({}), // Send empty body, backend fills with defaults
        });

        if (res.ok) {
          const data = await res.json();
          toast.success("Sample Product Created! Redirecting to edit page...");
          // No need to fetchProducts immediately here, as we navigate away
          navigate(`/admin/product/${data._id}/edit`); // Navigate to edit page
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to create product");
        }
      } catch (error) {
        toast.error("Network error or server unavailable");
        console.error("Create product error:", error);
      } finally {
        setCreateLoading(false);
      }
    }
  };

  // Framer Motion variants for table rows
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Product List - Admin Panel</title>
        <meta
          name="description"
          content="Admin panel for managing all products at Ninad's Pottery."
        />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <button
          onClick={createProductHandler}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          disabled={createLoading}
        >
          <MdAdd className="mr-1 text-xl" /> Create Product
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-600">Loading products...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-600">Error: {error}</p>
      ) : products.length === 0 ? (
        <p className="text-center py-10 text-gray-600">
          No products available.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <motion.tbody
              className="bg-white divide-y divide-gray-200"
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.05 }} // Stagger children for entrance animation
            >
              {products.map((product) => (
                <motion.tr
                  key={product._id}
                  className="hover:bg-gray-50"
                  variants={itemVariants}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.countInStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2 items-center">
                    <Link
                      to={`/admin/product/${product._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center justify-center space-x-1"
                    >
                      <MdEdit className="text-lg" /> Edit
                    </Link>
                    <button
                      onClick={() => deleteHandler(product._id)}
                      className="text-red-600 hover:text-red-900 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={deleteLoading}
                    >
                      <MdDelete className="text-lg" /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductListPage;
