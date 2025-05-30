// server/models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product", // Reference to the Product model
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    qty: {
      type: Number,
      required: true,
      default: 1, // Default quantity for an item
      min: 1, // Ensure quantity is at least 1
    },
  },
  {
    _id: false, // Do not create an _id for subdocuments (cart items)
  }
);

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User model
      unique: true, // A user should only have one cart
    },
    items: [cartItemSchema], // Array of cart items
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to update totalPrice before saving the cart
cartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
