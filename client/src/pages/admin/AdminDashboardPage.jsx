// client/src/pages/admin/AdminDashboardPage.jsx
import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  MdCategory,
  MdShoppingBag,
  MdPeople,
  MdDashboard,
} from "react-icons/md"; // Icons for dashboard

function AdminDashboardPage() {
  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if user is admin, if   not, redirect
  useEffect(() => {
    if (!authState.user || authState.user.role !== "admin") {
      navigate("/login");
      toast.error("Unauthorized access. Admin privileges required.");
    }
  }, [authState.user, navigate]);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: { scale: 1.05, boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1)" },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Admin Dashboard - Ninad's Pottery</title>
        <meta
          name="description"
          content="Central administration panel for Ninad's Pottery. Manage products, orders, users, and more."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Admin Dashboard
      </h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* Products Management Card */}
        <Link to="/admin/products">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors duration-200"
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
          >
            <MdShoppingBag className="text-6xl text-blue-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Product Management
            </h2>
            <p className="text-gray-600 mt-2">
              Add, edit, and delete products.
            </p>
          </motion.div>
        </Link>

        {/* Orders Management Card */}
        <Link to="/admin/orders">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-50 transition-colors duration-200"
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
          >
            <MdCategory className="text-6xl text-green-600 mb-4" />{" "}
            {/* Using MdCategory for orders for now, can change */}
            <h2 className="text-2xl font-semibold text-gray-800">
              Order Management
            </h2>
            <p className="text-gray-600 mt-2">
              View and update customer orders.
            </p>
          </motion.div>
        </Link>

        {/* User Management Card */}
        <Link to="/admin/users">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple-50 transition-colors duration-200"
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
          >
            <MdPeople className="text-6xl text-purple-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">
              User Management
            </h2>
            <p className="text-gray-600 mt-2">Manage customer accounts.</p>
          </motion.div>
        </Link>

        {/* Add more cards for other admin sections as needed, e.g.,
                <Link to="/admin/reports">
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-orange-50 transition-colors duration-200"
                        variants={cardVariants}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                    >
                        <MdDashboard className="text-6xl text-orange-600 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h2>
                        <p className="text-gray-600 mt-2">Access sales reports and site analytics.</p>
                    </motion.div>
                </Link>
                */}
      </motion.div>
    </div>
  );
}

export default AdminDashboardPage;
