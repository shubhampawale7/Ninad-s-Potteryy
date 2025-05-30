// client/src/pages/admin/OrderListPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import {
  MdCheckCircle,
  MdCancel,
  MdLocalShipping,
  MdVisibility,
} from "react-icons/md"; // Icons
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

function OrderListPage() {
  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliverLoading, setDeliverLoading] = useState(false); // For deliver action

  // Check if user is admin
  useEffect(() => {
    if (!authState.user || authState.user.role !== "admin") {
      navigate("/login");
      toast.error("Unauthorized access. Admin privileges required.");
    }
  }, [authState.user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch ALL orders (admin endpoint)
      const res = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${authState.user.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch orders: ${err.message}`);
      console.error("Fetch all orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user && authState.user.role === "admin") {
      fetchOrders();
    }
  }, [authState.user]); // Re-fetch on user state change

  const deliverHandler = async (orderId) => {
    if (
      window.confirm("Are you sure you want to mark this order as DELIVERED?")
    ) {
      setDeliverLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/orders/${orderId}/deliver`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authState.user.token}`,
            },
          }
        );

        if (res.ok) {
          toast.success("Order marked as delivered!");
          fetchOrders(); // Re-fetch all orders to update status
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to mark order as delivered");
        }
      } catch (error) {
        toast.error("Network error or server unavailable");
        console.error("Deliver order error:", error);
      } finally {
        setDeliverLoading(false);
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
        <title>Order List - Admin Panel</title>
        <meta
          name="description"
          content="Admin panel for managing all customer orders at Ninad's Pottery."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        All Orders
      </h1>

      {loading ? (
        <p className="text-center py-10 text-gray-600">Loading all orders...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-600">Error: {error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center py-10 text-gray-600">No orders placed yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivered
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
              {orders.map((order) => (
                <motion.tr
                  key={order._id}
                  className="hover:bg-gray-50"
                  variants={itemVariants}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.user ? order.user.name : "Deleted User"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {order.isPaid ? (
                      <MdCheckCircle
                        className="text-green-600 text-xl mx-auto"
                        title={`Paid on ${order.paidAt.substring(0, 10)}`}
                      />
                    ) : (
                      <MdCancel
                        className="text-red-600 text-xl mx-auto"
                        title="Not Paid"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {order.isDelivered ? (
                      <MdCheckCircle
                        className="text-green-600 text-xl mx-auto"
                        title={`Delivered on ${order.deliveredAt.substring(
                          0,
                          10
                        )}`}
                      />
                    ) : (
                      <MdCancel
                        className="text-red-600 text-xl mx-auto"
                        title="Not Delivered"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2 items-center">
                    <Link
                      to={`/order/${order._id}`}
                      className="text-blue-600 hover:text-blue-900 flex items-center justify-center space-x-1"
                    >
                      <MdVisibility className="text-lg" /> View
                    </Link>
                    {!order.isDelivered && (
                      <button
                        onClick={() => deliverHandler(order._id)}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deliverLoading}
                      >
                        <MdLocalShipping className="text-lg" /> Mark Delivered
                      </button>
                    )}
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

export default OrderListPage;
