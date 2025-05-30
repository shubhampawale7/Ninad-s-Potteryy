// client/src/context/CartContext.jsx
import React, { createContext, useReducer, useEffect } from "react";
import { toast } from "sonner";

// Initial state
const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
  shippingAddress: JSON.parse(localStorage.getItem("shippingAddress")) || {},
  paymentMethod: localStorage.getItem("paymentMethod") || "",
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "CART_ADD_ITEM": {
      const newItem = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.product === newItem.product
      );

      let updatedCartItems;

      if (existItem) {
        updatedCartItems = state.cartItems.map((x) =>
          x.product === existItem.product ? newItem : x
        );
        toast.success("Updated product in cart");
      } else {
        updatedCartItems = [...state.cartItems, newItem];
        toast.success("Added to cart");
      }

      return { ...state, cartItems: updatedCartItems };
    }

    case "CART_REMOVE_ITEM": {
      const updatedCartItems = state.cartItems.filter(
        (x) => x.product !== action.payload
      );
      toast.info("Removed item from cart");
      return { ...state, cartItems: updatedCartItems };
    }

    case "CART_SAVE_SHIPPING_ADDRESS":
      return { ...state, shippingAddress: action.payload };

    case "CART_SAVE_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.payload };

    case "CART_CLEAR_ITEMS":
      toast.info("Cart cleared after order");
      return {
        cartItems: [],
        shippingAddress: {},
        paymentMethod: "",
      };

    default:
      return state;
  }
};

// Context
export const CartContext = createContext();

// Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    localStorage.setItem(
      "shippingAddress",
      JSON.stringify(state.shippingAddress)
    );
    localStorage.setItem("paymentMethod", state.paymentMethod);
  }, [state.cartItems, state.shippingAddress, state.paymentMethod]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
