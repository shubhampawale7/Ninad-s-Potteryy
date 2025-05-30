// client/src/pages/AdminLoginPage.jsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion"; // For subtle animations

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in AND is admin
  useEffect(() => {
    if (state.user && state.user.role === "admin") {
      navigate("/admin"); // Redirect to admin dashboard
    } else if (state.user && state.user.role === "user") {
      // If logged in as a regular user, but trying to access admin login
      toast.info(
        "You are already logged in as a regular user. Please log out to access admin login."
      );
      navigate("/"); // Redirect to regular homepage
    }
  }, [state.user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.role === "admin") {
          dispatch({ type: "LOGIN_SUCCESS", payload: data });
          toast.success("Admin login successful! Welcome to the dashboard.");
          navigate("/admin"); // Navigate to admin dashboard
        } else {
          // User logged in, but not an admin
          dispatch({
            type: "LOGIN_FAIL",
            payload: "Not authorized as an admin",
          });
          toast.error(
            "Login successful, but you are not authorized to access the admin panel."
          );
          // Important: Clear userInfo from localStorage if a regular user tries to login via admin page
          // This prevents them from being logged in as a regular user after failing admin login.
          localStorage.removeItem("userInfo");
        }
      } else {
        dispatch({ type: "LOGIN_FAIL", payload: data.message });
        toast.error(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      dispatch({ type: "LOGIN_FAIL", payload: error.message });
      toast.error("Network error or server unavailable");
      console.error("Admin login error:", error);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-purple-800 p-4">
      <Helmet>
        <title>Admin Login - Ninad's Pottery</title>
        <meta
          name="description"
          content="Admin login page for Ninad's Pottery management panel."
        />
      </Helmet>

      <motion.div
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Admin Login
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Access the Ninad's Pottery administration panel.
        </p>

        {state.loading && (
          <p className="text-center text-blue-500 mb-4">Logging in...</p>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full text-lg transition-colors duration-200"
            disabled={state.loading}
          >
            Login as Admin
          </button>
        </form>

        {/* Important Security Notice for Admin Registration */}
        <div
          className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded"
          role="alert"
        >
          <p className="font-bold">Important: Admin Registration</p>
          <p className="text-sm">
            Admin accounts are **not** created directly via public registration
            for security reasons. The first admin account is typically set up
            manually in the database. Subsequent admin users can be promoted by
            an existing admin through the
            <Link
              to="/admin/users"
              className="text-blue-600 hover:underline ml-1"
            >
              Admin User Management
            </Link>{" "}
            panel.
          </p>
          <p className="text-sm mt-2">
            If you need an account to be promoted, you can{" "}
            <Link to="/adminregister" className="text-blue-600 hover:underline">
              register a regular account here
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLoginPage;
