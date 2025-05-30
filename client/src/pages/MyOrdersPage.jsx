// client/src/pages/MyOrdersPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

function MyOrdersPage() {
  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authState.user) {
      toast.error("Please log in to view your orders.");
      navigate("/login");
      return;
    }

    const fetchMyOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/orders/myorders", {
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
        console.error("Fetch my orders error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [authState.user, navigate]); // Re-fetch if user changes

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>My Orders - Ninad's Pottery</title>
        <meta
          name="description"
          content="View your past orders at Ninad's Pottery."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        My Orders
      </h1>

      {loading ? (
        <p className="text-center py-10 text-gray-600">
          Loading your orders...
        </p>
      ) : error ? (
        <p className="text-center py-10 text-red-600">Error: {error}</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/shop"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
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
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.isPaid ? (
                      <span className="text-green-600">
                        Paid on {order.paidAt.substring(0, 10)}
                      </span>
                    ) : (
                      <span className="text-red-600">Not Paid</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.isDelivered ? (
                      <span className="text-green-600">
                        Delivered on {order.deliveredAt.substring(0, 10)}
                      </span>
                    ) : (
                      <span className="text-red-600">Not Delivered</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/order/${order._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Details
                    </Link>
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

export default MyOrdersPage;
