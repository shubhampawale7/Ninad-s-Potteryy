// client/src/components/routes/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = ({ component: Component }) => {
  const { state } = useContext(AuthContext);

  // If user is logged in, render the component, otherwise redirect to login
  return state.user ? Component : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
