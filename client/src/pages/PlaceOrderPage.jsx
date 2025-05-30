// client/src/pages/PlaceOrderPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import CheckoutSteps from "../components/checkout/CheckoutSteps";
import { Helmet } from "react-helmet-async";

function PlaceOrderPage() {
  const navigate = useNavigate();
  const { state: cartState, dispatch: cartDispatch } = useContext(CartContext);
  const { state: authState } = useContext(AuthContext);

  const [orderCreationLoading, setOrderCreationLoading] = useState(false);
  const [orderCreationError, setOrderCreationError] = useState(null);

  const { cartItems, shippingAddress, paymentMethod } = cartState;

  // Calculate prices
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  // Add realistic shipping price logic here
  const shippingPrice = itemsPrice > 1000 ? 0 : 50; // Example: Free shipping over 1000 INR
  // Add tax price logic here
  const taxPrice = 0.18 * itemsPrice; // Example: 18% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Redirect if not all steps completed
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
      toast.warning("Please enter your shipping address first.");
    } else if (!paymentMethod) {
      navigate("/payment");
      toast.warning("Please select a payment method first.");
    } else if (cartItems.length === 0) {
      navigate("/cart");
      toast.warning("Your cart is empty.");
    }
  }, [shippingAddress, paymentMethod, cartItems, navigate]);

  const placeOrderHandler = async () => {
    setOrderCreationLoading(true);
    setOrderCreationError(null);

    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        // Order creation API endpoint (will create next)
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.user.token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        // Order created successfully, now proceed with Razorpay
        toast.success("Order placed successfully! Redirecting to payment...");
        // Store order details in session/context to use with Razorpay
        // For now, we'll just navigate to a success page.
        // Real Razorpay integration will happen here.
        cartDispatch({ type: "CART_CLEAR_ITEMS" }); // Clear cart after order is placed
        navigate(`/order/${data._id}`); // Navigate to order details page (will create next)
      } else {
        setOrderCreationError(data.message);
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      setOrderCreationError(error.message);
      toast.error("Network error or server unavailable");
      console.error("Place order error:", error);
    } finally {
      setOrderCreationLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Place Order - Ninad's Pottery</title>
        <meta
          name="description"
          content="Review your order details and place your order at Ninad's Pottery."
        />
      </Helmet>

      <CheckoutSteps step1 step2 step3 step4 />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Order Details Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
          {/* Shipping */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Shipping
            </h2>
            <p className="text-gray-700">
              <strong>Address:</strong> {shippingAddress.address},{" "}
              {shippingAddress.city}, {shippingAddress.postalCode},{" "}
              {shippingAddress.country}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Payment Method
            </h2>
            <p className="text-gray-700">
              <strong>Method:</strong> {paymentMethod}
            </p>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Order Items
            </h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
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

        {/* Order Summary Column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Order Summary
          </h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-gray-900">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {orderCreationError && (
            <p className="text-red-500 text-sm mt-4 text-center">
              {orderCreationError}
            </p>
          )}

          <button
            onClick={placeOrderHandler}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={orderCreationLoading || cartItems.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrderPage;
