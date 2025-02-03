const Transaction = require('../models/Transaction');
const crypto = require('crypto');

// Generate a random SWIFT code
const generateSwiftCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create a new transaction
async function createTransaction(req, res) {
  try {
    const { amount, currency, provider, recipientAccountInfo } = req.body;
    const customerId = req.user.id;  // Get customer ID from authenticated user

    const swiftCode = generateSwiftCode();
    const newTransaction = new Transaction({
      customer: customerId,
      amount,
      currency,
      provider,
      swiftCode,
      recipientAccountInfo,
      status: 'pending'
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: savedTransaction,
      swiftCode: swiftCode
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
}

// Get user's transactions (renamed for consistency)
async function getMyTransactions(req, res) {
  try {
    const customerId = req.user.id;
    const transactions = await Transaction.find({ customer: customerId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
}

// Get transaction by ID
async function getTransactionById(req, res) {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('customer', 'username first_name last_name');

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (req.user.role !== 'admin' && transaction.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction" });
  }
}

// Get all pending transactions (admin only)
async function getPendingTransactions(req, res) {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .populate('customer', 'username first_name last_name account_number')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending transactions" });
  }
}

// Verify transaction (admin only)
async function verifyTransaction(req, res) {
  try {
    const { transactionId } = req.params;
    const { action, verificationNotes } = req.body;

    if (!['completed', 'rejected'].includes(action)) {
      return res.status(400).json({ message: "Invalid action specified" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: "Transaction is no longer pending" });
    }

    transaction.status = action;
    transaction.verifiedBy = req.user.id;
    transaction.verificationDate = Date.now();
    transaction.verificationNotes = verificationNotes;

    await transaction.save();
    res.json({ message: `Transaction ${action}`, transaction });
  } catch (error) {
    res.status(500).json({ message: "Error verifying transaction" });
  }
}

module.exports = {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  getPendingTransactions,
  verifyTransaction
};