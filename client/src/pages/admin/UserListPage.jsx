// client/src/pages/admin/UserListPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { MdCheckCircle, MdCancel, MdEdit, MdDelete } from "react-icons/md"; // Icons

function UserListPage() {
  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false); // For delete action
  const [updateLoading, setUpdateLoading] = useState(false); // For update role action

  // Check if user is admin, if not, redirect
  useEffect(() => {
    if (!authState.user || authState.user.role !== "admin") {
      navigate("/login");
      toast.error("Unauthorized access. Admin privileges required.");
    }
  }, [authState.user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${authState.user.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch users: ${err.message}`);
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user && authState.user.role === "admin") {
      fetchUsers();
    }
  }, [authState.user]);

  const deleteHandler = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      setDeleteLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authState.user.token}`,
          },
        });

        if (res.ok) {
          toast.success("User deleted successfully!");
          fetchUsers(); // Re-fetch users after deletion
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to delete user");
        }
      } catch (error) {
        toast.error("Network error or server unavailable");
        console.error("Delete user error:", error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const updateRoleHandler = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      window.confirm(
        `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`
      )
    ) {
      setUpdateLoading(true); // Assuming one global loading state or per-row loading
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.user.token}`,
          },
          body: JSON.stringify({ role: newRole }),
        });

        if (res.ok) {
          toast.success(`User role updated to ${newRole.toUpperCase()}!`);
          fetchUsers(); // Re-fetch users to update UI
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to update user role");
        }
      } catch (error) {
        toast.error("Network error or server unavailable");
        console.error("Update user role error:", error);
      } finally {
        setUpdateLoading(false);
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>User List - Admin Panel</title>
        <meta
          name="description"
          content="Admin panel for managing all user accounts at Ninad's Pottery."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        User Management
      </h1>

      {loading ? (
        <p className="text-center py-10 text-gray-600">Loading users...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-600">Error: {error}</p>
      ) : users.length === 0 ? (
        <p className="text-center py-10 text-gray-600">
          No users registered yet.
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
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
              transition={{ staggerChildren: 0.05 }}
            >
              {users.map((user) => (
                <motion.tr
                  key={user._id}
                  className="hover:bg-gray-50"
                  variants={itemVariants}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2 items-center">
                    {/* Link to edit user profile (if you add a separate edit page for users later) */}
                    {/* <Link to={`/admin/user/${user._id}/edit`} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-center space-x-1">
                                            <MdEdit className="text-lg" /> Edit
                                        </Link> */}
                    <button
                      onClick={() => updateRoleHandler(user._id, user.role)}
                      className={`py-1 px-3 rounded flex items-center justify-center space-x-1 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.role === "admin"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      disabled={
                        updateLoading || user._id === authState.user._id
                      } // Prevent admin from changing their own role
                      title={
                        user.role === "admin"
                          ? "Demote to User"
                          : "Promote to Admin"
                      }
                    >
                      <MdEdit className="text-lg" />{" "}
                      {user.role === "admin" ? "Demote" : "Promote"}
                    </button>
                    <button
                      onClick={() => deleteHandler(user._id)}
                      className="text-red-600 hover:text-red-900 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        deleteLoading || user._id === authState.user._id
                      } // Prevent admin from deleting themselves
                      title="Delete User"
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

export default UserListPage;
