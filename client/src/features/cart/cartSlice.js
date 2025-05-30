// client/src/features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

// Helper to get cart items from localStorage (if any)
const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  loading: false,
  error: null,
  totalItems: 0, // For display in header/cart summary
  totalPrice: 0, // For cart summary
};

// Helper function to update totals
const updateCartTotals = (state) => {
  state.totalItems = state.cartItems.reduce((acc, item) => acc + item.qty, 0);
  state.totalPrice = state.cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );
};

// Thunk to add item to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, qty, token }, { rejectWithValue }) => {
    try {
      const config = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty }),
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
        config
      );
      // const res = await fetch(`http://localhost:5000/api/cart`, config); // Use if not using VITE_API_BASE_URL

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(
          errorData.message || "Failed to add item to cart"
        );
      }

      const data = await res.json();
      // Backend returns the full updated cart, extract just the items for local state
      return data.items;
    } catch (error) {
      return rejectWithValue(error.message || "Network error occurred");
    }
  }
);

// Thunk to remove item from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      const config = {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await fetch(
        `http://localhost:5000/api/users/wishlist/${productId}`,
        config
      );
      // const res = await fetch(`http://localhost:5000/api/cart/${productId}`, config); // Use if not using VITE_API_BASE_URL

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(
          errorData.message || "Failed to remove item from cart"
        );
      }

      // Backend returns updated cart after deletion, extract items
      const data = await res.json();
      return data.cart.items; // Assuming backend sends { message, cart: {items: [...]} }
    } catch (error) {
      return rejectWithValue(error.message || "Network error occurred");
    }
  }
);

// Thunk to update item quantity in cart
export const updateCartQty = createAsyncThunk(
  "cart/updateCartQty",
  async ({ productId, qty, token }, { rejectWithValue }) => {
    try {
      const config = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qty }),
      };

      const res = await fetch(
        `http://localhost:5000/api/users/wishlist/${productId}`,
        config
      );
      // const res = await fetch(`http://localhost:5000/api/cart/${productId}`, config); // Use if not using VITE_API_BASE_URL

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(
          errorData.message || "Failed to update item quantity"
        );
      }

      // Backend returns updated cart, extract items
      const data = await res.json();
      return data.items;
    } catch (error) {
      return rejectWithValue(error.message || "Network error occurred");
    }
  }
);

// Thunk to fetch user's cart on page load (or login)
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (token, { rejectWithValue }) => {
    try {
      const config = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
        config
      );
      // const res = await fetch(`http://localhost:5000/api/cart`, config); // Use if not using VITE_API_BASE_URL

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || "Failed to fetch cart");
      }

      const data = await res.json();
      return data.items; // Backend sends { user, items, totalPrice }
    } catch (error) {
      return rejectWithValue(error.message || "Network error occurred");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // This can be used for a local add without API call (less robust)
    // Or if you only want to update local state based on API response
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
      updateCartTotals(state);
    },
    // This is crucial if we decide to handle initial cart loading from localStorage directly
    // when user is not logged in or during very first render.
    // However, with API integration, the thunk is preferred for logged in users.
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
      localStorage.setItem("cartItems", JSON.stringify(action.payload));
      updateCartTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.cartItems = action.payload; // Update cartItems with backend response
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        updateCartTotals(state);
        toast.success("Item added to cart!");
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Remove From Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.cartItems = action.payload; // Update cartItems with backend response
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        updateCartTotals(state);
        toast.info("Item removed from cart.");
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Update Cart Quantity
      .addCase(updateCartQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.cartItems = action.payload; // Update cartItems with backend response
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        updateCartTotals(state);
        toast.success("Cart quantity updated!");
      })
      .addCase(updateCartQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.cartItems = action.payload; // Update cartItems with backend response
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        updateCartTotals(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't show toast for initial fetch errors, just log
        console.error("Failed to fetch cart on load:", action.payload);
      });
  },
});

export const { clearCart, setCartItems } = cartSlice.actions; // Export synchronous actions
export default cartSlice.reducer;
