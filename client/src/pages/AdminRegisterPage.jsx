// client/src/pages/AdminRegisterPage.jsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion"; // For subtle animations

function AdminRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { state, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (state.user) {
      if (state.user.role === "admin") {
        navigate("/admin"); // Admin already logged in, go to admin dashboard
      } else {
        navigate("/"); // Regular user logged in, go to homepage
      }
    }
  }, [state.user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch({ type: "REGISTER_REQUEST" });
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch({ type: "REGISTER_SUCCESS", payload: data });
        toast.success(
          "Registration successful! Your account is now a regular user account. An existing administrator must promote you to admin role."
        );
        navigate("/adminlogin"); // Navigate to admin login page after registration
      } else {
        dispatch({ type: "REGISTER_FAIL", payload: data.message });
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      dispatch({ type: "REGISTER_FAIL", payload: error.message });
      toast.error("Network error or server unavailable");
      console.error("Registration error:", error);
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
        <title>Admin Registration - Ninad's Pottery</title>
        <meta
          name="description"
          content="Register an account for Ninad's Pottery admin panel. Admin privileges require manual promotion by an existing administrator."
        />
      </Helmet>
      <motion.div
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
          Admin Register
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Register for a new account. Admin access requires an existing
          administrator to promote your role.
        </p>

        {state.loading && (
          <p className="text-center text-blue-500 mb-4">Registering...</p>
        )}

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="Enter email"
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
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full text-lg transition-colors duration-200"
            disabled={state.loading}
          >
            Register Account
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/adminlogin" className="text-blue-500 hover:underline">
            Admin Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default AdminRegisterPage;
