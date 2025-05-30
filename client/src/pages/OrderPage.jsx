// client/src/pages/OrderPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";

function OrderPage() {
  const { id: orderId } = useParams(); // Get order ID from URL
  const { state: authState } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load Razorpay script
  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${authState.user.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch order: ${err.message}`);
      console.error("Fetch order error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authState.user) {
      // Handle case where user is not logged in but tries to access order page directly
      // This scenario should ideally be caught by ProtectedRoute, but good to have fallback.
      toast.error("Please log in to view your orders.");
      // navigate('/login'); // You might want to redirect
      return;
    }
    if (!order || order._id !== orderId) {
      // Fetch only if order is not loaded or is different
      fetchOrder();
    }
  }, [order, orderId, authState.user]);

  const payWithRazorpay = async () => {
    // Get Razorpay Key from backend (Razorpay recommends fetching key from backend)
    // You will need a new backend endpoint for this
    // For now, let's use a dummy key, but REMEMBER TO FETCH FROM BACKEND FOR PRODUCTION!
    const RAZORPAY_KEY = "rzp_test_YOUR_RAZORPAY_KEY_ID"; // Replace with your actual Test Key ID from Razorpay Dashboard

    const scriptLoaded = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!scriptLoaded) {
      toast.error("Razorpay SDK failed to load. Are you offline?");
      return;
    }

    // Create an order in Razorpay (backend API call)
    // This is crucial. Your backend needs to create an order with Razorpay and return the order_id.
    // For simplicity, let's assume we call a backend endpoint /api/config/razorpay which creates a Razorpay order.
    // THIS PART WILL BE IMPLEMENTED IN THE NEXT STEP (Backend Razorpay Orders)
    let razorpayOrderResponse;
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/razorpay`,
        {
          method: "POST", // Or GET if you're just fetching existing Razorpay order data
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.user.token}`,
          },
          body: JSON.stringify({ amount: Math.round(order.totalPrice * 100) }), // Amount in paise
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to create Razorpay order: ${res.status}`);
      }
      razorpayOrderResponse = await res.json();
    } catch (err) {
      toast.error(err.message || "Error creating Razorpay order");
      console.error("Razorpay order creation error:", err);
      return;
    }

    const options = {
      key: RAZORPAY_KEY, // Enter the Key ID generated from the Dashboard
      amount: razorpayOrderResponse.amount, // Amount in paise (from backend order)
      currency: razorpayOrderResponse.currency, // Currency (from backend order)
      name: "Ninad's Pottery",
      description: `Order ${orderId}`,
      order_id: razorpayOrderResponse.id, // This is the ID from Razorpay's backend
      handler: async function (response) {
        // Callback on successful payment
        try {
          const paymentVerificationRes = await fetch(
            `http://localhost:5000/api/orders/${orderId}/pay`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authState.user.token}`,
              },
              body: JSON.stringify({
                id: response.razorpay_payment_id,
                status: "COMPLETED", // Or success
                update_time: new Date().toISOString(),
                email_address: authState.user.email,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );
          const data = await paymentVerificationRes.json();
          if (paymentVerificationRes.ok) {
            setOrder(data); // Update order state with paid status
            toast.success("Payment successful and order paid!");
          } else {
            toast.error(data.message || "Payment verification failed");
          }
        } catch (error) {
          toast.error("Error verifying payment.");
          console.error("Payment verification error:", error);
        }
      },
      prefill: {
        name: authState.user.name,
        email: authState.user.email,
        contact: "", // Optional: user's phone number
      },
      notes: {
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
      },
      theme: {
        color: "#3399CC",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  if (loading)
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">Loading order details...</p>
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto animate-spin"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 text-xl">
        <p>Error: {error}</p>
        <p>
          Please ensure the backend server is running and accessible or check
          your network.
        </p>
      </div>
    );
  if (!order)
    return (
      <div className="text-center py-10 text-gray-600 text-xl">
        <p>Order not found.</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Order {order._id} - Ninad's Pottery</title>
        <meta
          name="description"
          content={`Details for your order ${order._id} at Ninad's Pottery.`}
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Order {order._id}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Order Details Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
          {/* Shipping */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Shipping
            </h2>
            <p className="text-gray-700">
              <strong>Name: </strong> {order.user.name}
            </p>
            <p className="text-gray-700">
              <strong>Email: </strong>{" "}
              <a
                href={`mailto:${order.user.email}`}
                className="text-blue-600 hover:underline"
              >
                {order.user.email}
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> {order.shippingAddress.address},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </p>
            <div
              className={`mt-2 p-2 rounded-md ${
                order.isDelivered
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {order.isDelivered
                ? `Delivered on ${order.deliveredAt.substring(0, 10)}`
                : "Not Delivered"}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Payment Method
            </h2>
            <p className="text-gray-700">
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            <div
              className={`mt-2 p-2 rounded-md ${
                order.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {order.isPaid
                ? `Paid on ${order.paidAt.substring(0, 10)}`
                : "Not Paid"}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Order Items
            </h2>
            {order.orderItems.length === 0 ? (
              <p className="text-gray-600">Order is empty.</p>
            ) : (
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.images[0]?.url || "/images/placeholder.jpg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <Link
                        to={`/product/${item.product}`}
                        className="text-blue-600 hover:underline text-lg font-medium"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <p className="text-gray-800">
                      {item.qty} x ${item.price.toFixed(2)} = $
                      {(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Payment Button */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Order Summary
          </h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-gray-900">
              <span>Total:</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {!order.isPaid && (
            <button
              onClick={payWithRazorpay}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Pay with Razorpay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
