// client/src/pages/PaymentPage.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CartContext } from "../context/CartContext";
import CheckoutSteps from "../components/checkout/CheckoutSteps";
import { Helmet } from "react-helmet-async";

function PaymentPage() {
  const { state: cartState, dispatch: cartDispatch } = useContext(CartContext);
  const navigate = useNavigate();

  // If shipping address is not set, redirect back to shipping
  useEffect(() => {
    if (!cartState.shippingAddress) {
      navigate("/shipping");
      toast.warning("Please enter your shipping address first.");
    }
  }, [cartState.shippingAddress, navigate]);

  // Pre-fill with saved payment method if available, default to 'Razorpay'
  const [paymentMethod, setPaymentMethod] = useState(
    cartState.paymentMethod || "Razorpay"
  );

  const submitHandler = (e) => {
    e.preventDefault();

    cartDispatch({
      type: "CART_SAVE_PAYMENT_METHOD",
      payload: paymentMethod,
    });
    toast.success("Payment method saved!");
    navigate("/placeorder"); // Navigate to place order page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Payment Method - Ninad's Pottery</title>
        <meta
          name="description"
          content="Select your payment method for your Ninad's Pottery order."
        />
      </Helmet>
      <CheckoutSteps step1 step2 step3 /> {/* Highlight current step */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto mt-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Payment Method
        </h2>
        <form onSubmit={submitHandler} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Method
            </label>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="razorpay"
                name="paymentMethod"
                value="Razorpay"
                checked={paymentMethod === "Razorpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="razorpay" className="text-gray-900 text-lg">
                Razorpay
              </label>
            </div>
            {/* You can add more payment options here later */}
            {/* <div className="flex items-center mb-2">
                            <input
                                type="radio"
                                id="paypal"
                                name="paymentMethod"
                                value="PayPal"
                                checked={paymentMethod === 'PayPal'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="paypal" className="text-gray-900 text-lg">
                                PayPal
                            </label>
                        </div> */}
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

export default PaymentPage;
