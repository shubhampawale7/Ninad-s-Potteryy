// client/src/components/layout/Header.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import {
  MdAccountCircle,
  MdLogout,
  MdLogin,
  MdAddShoppingCart,
  MdStore,
} from "react-icons/md"; // Example icons

function Header() {
  const { state, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    toast.info("Logged out successfully!");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center z-10 sticky top-0">
      <Link
        to="/"
        className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        Ninad's Pottery
      </Link>
      <nav className="flex items-center space-x-6">
        <Link
          to="/shop"
          className="text-gray-700 hover:text-blue-600 font-semibold flex items-center transition-colors duration-200"
        >
          <MdStore className="mr-1" /> Shop
        </Link>
        <Link
          to="/about"
          className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
        >
          About
        </Link>
        <Link
          to="/contact"
          className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
        >
          Contact
        </Link>

        {state.user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-800 font-medium">
              Hello, {state.user.name.split(" ")[0]}!
            </span>{" "}
            {/* Display first name */}
            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <MdAddShoppingCart className="text-2xl" />{" "}
              {/* Shopping Cart Icon */}
            </Link>
            {state.user.role === "admin" && (
              <Link
                to="/admin"
                className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-200"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold flex items-center transition-colors duration-200"
            >
              <MdLogout className="mr-1" /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center transition-colors duration-200"
            >
              <MdLogin className="mr-1" /> Login
            </Link>
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center transition-colors duration-200"
            >
              <MdAccountCircle className="mr-1" /> Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
