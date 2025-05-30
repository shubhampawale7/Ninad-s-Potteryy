/* eslint-disable no-undef */
// client/src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"; // Import your auth reducer
import cartReducer from "../features/cart/cartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools only in development
});

export default store;
