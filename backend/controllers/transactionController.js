import Transaction from "../models/Transaction.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      amount,
      type,
      categoryId,
      tags,
      isRecurring,
      recurringFrequency,
      description,
    } = req.body;

    // Validate required fields
    if (!amount || !type || !categoryId) {
      return res
        .status(400)
        .json({ message: "Amount, type, and category are required" });
    }

    // Create a new transaction
    const newTransaction = new Transaction({
      userId: req.user.userId, // Get userId from the JWT token
      amount,
      type,
      categoryId,
      tags,
      isRecurring,
      recurringFrequency,
      description,
    });

    // Save the transaction to the database
    await newTransaction.save();

    // Respond with the newly created transaction
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all transactions
export const getTransactions = async (req, res) => {
  try {

    // Get userId from req.user (set by JWT middleware)
    const userId = req.user?.userId; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    // Fetch all transactions for the logged-in user
    const transactions = await Transaction.find({ userId:userId })
      .populate("categoryId", "name") // Populate category name
      .sort({ date: -1 }); // Sort transactions by date in descending order

    // if (!transactions.length) {
    //   return res.status(404).json({ message: "No transactions found" });
    // }

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const {
      amount,
      type,
      categoryId,
      tags,
      isRecurring,
      recurringFrequency,
      description,
    } = req.body;

    // Find the transaction by ID and ensure it belongs to the logged-in user
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        amount,
        type,
        categoryId,
        tags,
        isRecurring,
        recurringFrequency,
        description,
      },
      { new: true } // Return the updated transaction
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ message: "Transaction not found or unauthorized" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    // Find and delete the transaction by ID and ensure it belongs to the logged-in user
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ message: "Transaction not found or unauthorized" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
