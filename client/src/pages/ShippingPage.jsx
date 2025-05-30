// client/src/pages/ShippingPage.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CartContext } from "../context/CartContext";
import CheckoutSteps from "../components/checkout/CheckoutSteps"; // We'll create this next
import { Helmet } from "react-helmet-async";

function ShippingPage() {
  const { state: cartState, dispatch: cartDispatch } = useContext(CartContext);
  const navigate = useNavigate();

  // Pre-fill with saved shipping address if available
  const [address, setAddress] = useState(
    cartState.shippingAddress?.address || ""
  );
  const [city, setCity] = useState(cartState.shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(
    cartState.shippingAddress?.postalCode || ""
  );
  const [country, setCountry] = useState(
    cartState.shippingAddress?.country || ""
  );

  useEffect(() => {
    // If cart is empty, redirect to cart page
    if (cartState.cartItems.length === 0) {
      navigate("/cart");
      toast.warning("Your cart is empty. Please add items to proceed.");
    }
  }, [cartState.cartItems, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (!address || !city || !postalCode || !country) {
      toast.error("Please fill in all shipping details.");
      return;
    }

    cartDispatch({
      type: "CART_SAVE_SHIPPING_ADDRESS",
      payload: { address, city, postalCode, country },
    });
    toast.success("Shipping address saved!");
    navigate("/payment"); // Navigate to payment page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Shipping Details - Ninad's Pottery</title>
        <meta
          name="description"
          content="Enter your shipping address for your Ninad's Pottery order."
        />
      </Helmet>
      <CheckoutSteps step1 step2 /> {/* Highlight current step */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto mt-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Shipping Address
        </h2>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="address"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="city"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="postalCode"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="country"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default ShippingPage;
