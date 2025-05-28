// client/src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (state.user) {
      navigate("/"); // Redirect to home or dashboard
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
        dispatch({ type: "LOGIN_SUCCESS", payload: data });
        toast.success("Login successful! Welcome back!");
        navigate("/"); // Navigate to home or dashboard
      } else {
        dispatch({ type: "LOGIN_FAIL", payload: data.message });
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      dispatch({ type: "LOGIN_FAIL", payload: error.message });
      toast.error("Network error or server unavailable");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        {state.loading && (
          <p className="text-center text-blue-500 mb-4">Loading...</p>
        )}
        {/* state.error is handled by toast */}

        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={state.loading}
            >
              Login
            </button>
          </div>
          <p className="text-center text-gray-600 text-sm mt-4">
            New customer?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
