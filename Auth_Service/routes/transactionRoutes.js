import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from "../controllers/transactionController.js";

const router = express.Router();

// Protect all routes below with verifyToken middleware
router.use(verifyToken);

// Route to create a new transaction
router.post("/", createTransaction);

// Route to get all transactions for the logged-in user
router.get("/", getTransactions);

// Route to update a transaction by ID
router.put("/:id", updateTransaction);

// Route to delete a transaction by ID
router.delete("/:id", deleteTransaction);

export default router;
