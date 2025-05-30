// client/src/pages/CartPage.jsx
import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { MdDelete } from "react-icons/md"; // React Icons for delete
import { Helmet } from "react-helmet-async";

function CartPage() {
  const { state: cartState, dispatch: cartDispatch } = useContext(CartContext);
  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const { cartItems } = cartState;

  useEffect(() => {
    // Optional: Redirect to login if cart is not empty and user is not logged in?
    // For now, allow viewing cart but require login for checkout.
  }, [authState.user]);

  const removeFromCartHandler = (id) => {
    cartDispatch({ type: "CART_REMOVE_ITEM", payload: id });
    toast.info("Item removed from cart.");
  };

  const updateQtyHandler = (id, qty) => {
    // Find the product in cartItems to get its full details (especially countInStock)
    const product = cartItems.find((item) => item.product === id);

    if (product && qty > product.countInStock) {
      toast.error(
        `Cannot add more than ${product.countInStock} of this item (in stock).`
      );
      return;
    }

    // Re-dispatch the item with updated quantity
    cartDispatch({
      type: "CART_ADD_ITEM", // Reuse ADD_ITEM logic to update quantity if item exists
      payload: {
        product: product.product,
        name: product.name,
        images: product.images,
        price: product.price,
        countInStock: product.countInStock,
        qty: Number(qty),
      },
    });
    toast.success("Quantity updated!");
  };

  const checkoutHandler = () => {
    if (!authState.user) {
      toast.warning("Please log in to proceed to checkout.");
      navigate("/login?redirect=/shipping"); // Redirect to login, then to shipping page
    } else {
      navigate("/shipping"); // Navigate to shipping page
    }
  };

  // Calculate subtotal
  const subtotal = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Your Shopping Cart - Ninad's Pottery</title>
        <meta
          name="description"
          content="Review your shopping cart items from Ninad's Pottery. Adjust quantities or proceed to checkout for handcrafted ceramics."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
          <Link
            to="/shop"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Go Back To Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="flex items-center justify-between border-b border-gray-200 py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center">
                  <Link to={`/product/${item.product}`}>
                    <img
                      src={item.images[0]?.url || "/images/placeholder.jpg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.product}`}>
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.qty}
                    onChange={(e) =>
                      updateQtyHandler(item.product, e.target.value)
                    }
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeFromCartHandler(item.product)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Remove from cart"
                  >
                    <MdDelete className="text-2xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Order Summary
            </h2>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-700">Items ({totalItems}):</p>
              <p className="font-semibold text-gray-900">${subtotal}</p>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-xl font-bold text-gray-800 flex justify-between">
                Total: <span>${subtotal}</span>
              </h3>
            </div>
            <button
              onClick={checkoutHandler}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0}
            >
              Proceed To Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
