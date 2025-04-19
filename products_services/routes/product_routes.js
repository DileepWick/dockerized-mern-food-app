import express from 'express';
import { createProduct } from '../controllers/product_controller.js'; // Import your product controller

const router = express.Router();

// Product routes
router.post('/products', createProduct); // Create a new product


export default router;

