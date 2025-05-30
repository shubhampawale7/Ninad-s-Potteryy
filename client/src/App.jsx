// client/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";

// Middleware Routes
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminRoute from "./components/routes/AdminRoute";

// Animation Wrapper
import PageTransition from "./components/animations/PageTransition";

// Public Pages
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import AdminLoginPage from "./pages/AdminLoginPage"; // NEW
import AdminRegisterPage from "./pages/AdminRegisterPage"; // NEW

// Protected User Pages
import ShippingPage from "./pages/ShippingPage";
import PaymentPage from "./pages/PaymentPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import OrderPage from "./pages/OrderPage"; // Ensure this is the main OrderPage, not the admin one
import MyOrdersPage from "./pages/MyOrdersPage";
import WishlistPage from "./pages/WishlistPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ProductListPage from "./pages/admin/ProductListPage";
import ProductEditPage from "./pages/admin/ProductEditPage";
import OrderListPage from "./pages/OrderListPage"; // This is the admin-specific OrderListPage
import UserListPage from "./pages/admin/UserListPage";

function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  // Explicitly check for dedicated auth pages to hide main header/footer
  const isSpecialAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/adminlogin" ||
    location.pathname === "/adminregister";

  return (
    <>
      <Toaster richColors position="top-right" />

      {/* Render the standard Header/Footer only if not on an admin route OR a special auth page */}
      <div
        className={
          !isAdminRoute && !isSpecialAuthPage
            ? "flex flex-col min-h-screen"
            : ""
        }
      >
        {!isAdminRoute && !isSpecialAuthPage && <Header />}
        <main
          className={!isAdminRoute && !isSpecialAuthPage ? "flex-grow" : ""}
        >
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PageTransition>
                    <HomePage />
                  </PageTransition>
                }
              />
              <Route
                path="/register"
                element={
                  <PageTransition>
                    <RegisterPage />
                  </PageTransition>
                }
              />
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <LoginPage />
                  </PageTransition>
                }
              />
              <Route
                path="/shop"
                element={
                  <PageTransition>
                    <ShopPage />
                  </PageTransition>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <PageTransition>
                    <ProductDetailPage />
                  </PageTransition>
                }
              />
              <Route
                path="/about"
                element={
                  <PageTransition>
                    <div>About Page Placeholder</div>
                  </PageTransition>
                }
              />
              <Route
                path="/contact"
                element={
                  <PageTransition>
                    <div>Contact Page Placeholder</div>
                  </PageTransition>
                }
              />
              <Route
                path="/cart"
                element={
                  <PageTransition>
                    <CartPage />
                  </PageTransition>
                }
              />

              {/* NEW Admin Auth Pages - Publicly accessible */}
              <Route
                path="/adminlogin"
                element={
                  <PageTransition>
                    <AdminLoginPage />
                  </PageTransition>
                }
              />
              <Route
                path="/adminregister"
                element={
                  <PageTransition>
                    <AdminRegisterPage />
                  </PageTransition>
                }
              />

              {/* Protected User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute
                    component={
                      <PageTransition>
                        <div>User Profile Placeholder</div>
                      </PageTransition>
                    }
                  />
                }
              />
              <Route
                path="/shipping"
                element={
                  <ProtectedRoute
                    component={
                      <PageTransition>
                        <ShippingPage />
                      </PageTransition>
                    }
                  />
                }
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute
                    component={
                      <PageTransition>
                        <PaymentPage />
                      </PageTransition>
                    }
                  />
                }
              />
              <Route
                path="/placeorder"
                element={
                  <ProtectedRoute
                    component={
                      <PageTransition>
                        <PlaceOrderPage />
                      </PageTransition>
                    }
                  />
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute
                    component={
                      <PageTransition>
                        <OrderPage />
                      </PageTransition>
                    }
                  />
                }
              />
              <Route
                path="/myorders"
                element={
                  <ProtectedRoute
                    component={
                      <PageTransition>
                        <MyOrdersPage />
                      </PageTransition>
                    }
                  />
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute
                    component={
                      <PageTransition>
                        <WishlistPage />
                      </PageTransition>
                    }
                  />
                }
              />

              {/* Admin Routes - Nested under AdminLayout */}
              <Route
                path="/admin"
                element={<AdminRoute component={<AdminLayout />} />}
              >
                <Route
                  index
                  element={
                    <PageTransition>
                      <AdminDashboardPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="products"
                  element={
                    <PageTransition>
                      <ProductListPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="product/:id/edit"
                  element={
                    <PageTransition>
                      <ProductEditPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <PageTransition>
                      <OrderListPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="users"
                  element={
                    <PageTransition>
                      <UserListPage />
                    </PageTransition>
                  }
                />
              </Route>

              {/* Fallback Route for 404 Not Found */}
              <Route
                path="*"
                element={
                  <PageTransition>
                    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center text-4xl text-red-500 font-bold">
                      404 - Page Not Found
                    </div>
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
        {!isAdminRoute && !isSpecialAuthPage && <Footer />}{" "}
        {/* Only show Footer for non-admin routes */}
      </div>
    </>
  );
}

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
