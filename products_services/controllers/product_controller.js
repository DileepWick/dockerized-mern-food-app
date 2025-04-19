// controllers/productController.js
import Product from "../models/product.js";

// utils/validateUser.js
import getUserId from "../utils/validateUser.js";


// This function handles the creation of a new product
export const createProduct = async (req, res) => {
  try {
    const { name, price, token } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Check if the user is authenticated by validating the JWT token
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate JWT token and get userId
    const userId = await getUserId(req.body.token); 

    // Create new product with userId from the authenticated user (req.user)
    const newProduct = new Product({
      name,
      price,
      userId: userId, // Associating product with the logged-in user
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
