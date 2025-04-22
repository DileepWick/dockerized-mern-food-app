import Product from "../models/product.js";

import { validateToken } from "../utils/validateUser.js";

export const createProduct = async (req, res) => {

  console.log("Token : ", req.cookies.token); // Debugging line

  const token = req.cookies.token;

  console.log("Token from request:", token); // Debugging line

  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized from product service" });

  const { name, price } = req.body;

  try {
    const product = await Product.create({
      name,
      price,
      userId: user.userId, // ← set userId from validated token
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
};

