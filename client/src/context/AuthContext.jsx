// client/src/context/AuthContext.jsx
import React, { createContext, useReducer, useEffect } from "react";

// Initial state for authentication
const initialState = {
  user: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  loading: false,
  error: null,
};

// Reducer function to handle state changes
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
    case "REGISTER_REQUEST":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return { ...state, loading: false, user: action.payload, error: null };
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
      return { ...state, loading: false, user: null, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null, error: null };
    default:
      return state;
  }
};

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Effect to update localStorage whenever user state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("userInfo", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
