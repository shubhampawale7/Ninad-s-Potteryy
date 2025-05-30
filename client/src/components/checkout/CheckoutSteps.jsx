// client/src/components/checkout/CheckoutSteps.jsx
import React from "react";
import { Link } from "react-router-dom";

function CheckoutSteps({ step1, step2, step3, step4 }) {
  return (
    <nav className="mb-8 flex justify-center space-x-4">
      <div
        className={`py-2 px-4 rounded-lg font-semibold text-center ${
          step1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        {step1 ? (
          <Link to="/login">Sign In</Link>
        ) : (
          <span className="cursor-not-allowed text-gray-500">Sign In</span>
        )}
      </div>
      <div
        className={`py-2 px-4 rounded-lg font-semibold text-center ${
          step2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        {step2 ? (
          <Link to="/shipping">Shipping</Link>
        ) : (
          <span className="cursor-not-allowed text-gray-500">Shipping</span>
        )}
      </div>
      <div
        className={`py-2 px-4 rounded-lg font-semibold text-center ${
          step3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        {step3 ? (
          <Link to="/payment">Payment</Link>
        ) : (
          <span className="cursor-not-allowed text-gray-500">Payment</span>
        )}
      </div>
      <div
        className={`py-2 px-4 rounded-lg font-semibold text-center ${
          step4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        {step4 ? (
          <Link to="/placeorder">Place Order</Link>
        ) : (
          <span className="cursor-not-allowed text-gray-500">Place Order</span>
        )}
      </div>
    </nav>
  );
}

export default CheckoutSteps;
