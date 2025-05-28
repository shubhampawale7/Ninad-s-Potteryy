// client/src/components/routes/AdminRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";

const AdminRoute = ({ component: Component }) => {
  const { state } = useContext(AuthContext);

  if (!state.user) {
    toast.error("You need to be logged in to view this page.");
    return <Navigate to="/login" replace />;
  }

  if (state.user && state.user.role === "admin") {
    return Component;
  } else {
    toast.error("You are not authorized to view this page.");
    return <Navigate to="/" replace />; // Redirect to home or another appropriate page
  }
};

export default AdminRoute;
