// client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import AppWithRouter from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux"; // ✅ Import Redux Provider
import store from "./app/store"; // ✅ Adjust this path to your actual store location

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      {/* ✅ Wrap with Redux Provider */}
      <AuthProvider>
        <CartProvider>
          <HelmetProvider>
            <AppWithRouter />
          </HelmetProvider>
        </CartProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
