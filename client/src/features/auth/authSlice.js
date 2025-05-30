// client/src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Get user info from localStorage if it exists
const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
      // You might also want to clear localStorage for cart, shipping, etc. here if they are not persisted to DB
      // localStorage.clear(); // Use with caution if you have other persisted data
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
