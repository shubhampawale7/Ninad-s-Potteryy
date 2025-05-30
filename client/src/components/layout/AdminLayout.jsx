// client/src/components/layout/AdminLayout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom"; // Outlet is used for nested routes
import {
  MdDashboard,
  MdShoppingBag,
  MdPeople,
  MdListAlt,
  MdLogout,
} from "react-icons/md"; // Icons for admin sidebar
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminLayout() {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    toast.info("Logged out successfully from admin panel!");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="text-2xl font-bold text-center mb-8 border-b border-gray-700 pb-4">
          <Link to="/admin" className="hover:text-blue-400">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-3">
            <li>
              <Link
                to="/admin"
                className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <MdDashboard className="mr-3 text-2xl" /> Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <MdShoppingBag className="mr-3 text-2xl" /> Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <MdListAlt className="mr-3 text-2xl" /> Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <MdPeople className="mr-3 text-2xl" /> Users
              </Link>
            </li>
            {/* Add more admin links here */}
          </ul>
        </nav>
        <div className="mt-auto border-t border-gray-700 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 rounded-lg text-lg bg-red-600 hover:bg-red-700 transition-colors duration-200"
          >
            <MdLogout className="mr-3 text-2xl" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 overflow-y-auto">
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
