/* eslint-disable no-unused-vars */
// client/src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; // Only Toaster here, toast is imported where needed

// Import your pages
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

// Import Layout/Common Components (we will create these soon)
import Header from "./components/layout/Header"; // Placeholder
import Footer from "./components/layout/Footer"; // Placeholder

// Import AuthContext for potential use in Header or protected routes
import { AuthContext } from "./context/AuthContext";

// Import middleware for routes
import ProtectedRoute from "./components/routes/ProtectedRoute"; // We'll create this next
import AdminRoute from "./components/routes/AdminRoute"; // We'll create this next

function App() {
  // You might use AuthContext here if the Header/Footer need to react to login state
  // const { state } = useContext(AuthContext);

  return (
    <Router>
      {/* Sonner Toaster component - renders notifications */}
      <Toaster richColors position="top-right" />

      {/* Optional: Add a Header component that appears on all pages */}
      <Header />

      <main className="flex-grow">
        {" "}
        {/* Flex-grow to push footer down */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/about"
            element={<div>About Page Placeholder</div>}
          />{" "}
          {/* Placeholder */}
          <Route
            path="/contact"
            element={<div>Contact Page Placeholder</div>}
          />{" "}
          {/* Placeholder */}
          <Route path="/shop" element={<div>Shop Page Placeholder</div>} />{" "}
          {/* Placeholder */}
          {/* Protected User Routes (accessible only if logged in) */}
          {/* Example: A user profile page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute component={<div>User Profile Placeholder</div>} />
            }
          />
          {/* Other protected routes like /cart, /checkout, /orders */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute component={<div>Cart Page Placeholder</div>} />
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute
                component={<div>Checkout Page Placeholder</div>}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute
                component={<div>My Orders Page Placeholder</div>}
              />
            }
          />
          {/* Protected Admin Routes (accessible only if logged in AND role is 'admin') */}
          {/* Example: Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute component={<div>Admin Dashboard Placeholder</div>} />
            }
          />
          {/* Other admin routes for product management, user management etc. */}
          <Route
            path="/admin/products"
            element={
              <AdminRoute component={<div>Admin Product Management</div>} />
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute component={<div>Admin Order Management</div>} />
            }
          />
          {/* Catch-all for 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="min-h-[calc(100vh-120px)] flex items-center justify-center text-4xl text-red-500 font-bold">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </main>

      {/* Optional: Add a Footer component that appears on all pages */}
      <Footer />
    </Router>
  );
}

export default App;
