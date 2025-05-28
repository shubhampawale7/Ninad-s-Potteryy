// server/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  // Use process.env.JWT_SECRET (from .env)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

export default generateToken;
