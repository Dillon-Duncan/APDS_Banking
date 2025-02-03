const Transaction = require('../models/Transaction');
const crypto = require('crypto');

// Validation patterns
const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const CURRENCY_REGEX = /^[A-Z]{3}$/;
const AMOUNT_REGEX = /^(?!0\d)\d+(\.\d{1,2})?$/;
const ACCOUNT_REGEX = /^[A-Z0-9]{10,20}$/i;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
const NOTES_REGEX = /^[a-zA-Z0-9\s.,!?@()\-'"%&*:;<>\/]{0,200}$/;

// Generate a random SWIFT code
const generateSwiftCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Enhanced validation middleware
const validateTransactionInput = (req, res, next) => {
  const { amount, currency, provider, swiftCode, recipientAccountInfo } = req.body;
  
  // Amount validation
  if (!AMOUNT_REGEX.test(amount.toString())) {
    return res.status(400).json({ 
      message: "Invalid amount format. Max 2 decimal places"
    });
  }

  // Currency validation
  if (!CURRENCY_REGEX.test(currency)) {
    return res.status(400).json({ 
      message: "Invalid 3-letter currency code"
    });
  }

  // SWIFT code sanitization
  if(swiftCode) {
    req.body.swiftCode = swiftCode.replace(/[^A-Z0-9]/g, '').substring(0, 11);
  }

  // Validate provider
  if (!NAME_REGEX.test(provider)) {
    return res.status(400).json({
      message: "Invalid provider name. Use 2-50 letters and spaces"
    });
  }

  // Validate recipient info
  const { accountNumber, accountName, bankName } = recipientAccountInfo || {};
  if (!ACCOUNT_REGEX.test(accountNumber)) {
    return res.status(400).json({
      message: "Invalid account number. Use 10-20 alphanumeric characters"
    });
  }

  if (!NAME_REGEX.test(accountName)) {
    return res.status(400).json({
      message: "Invalid account name. Use 2-50 letters and spaces"
    });
  }

  if (!NAME_REGEX.test(bankName)) {
    return res.status(400).json({
      message: "Invalid bank name. Use 2-50 letters and spaces"
    });
  }

  next();
};

// Create a new transaction
async function createTransaction(req, res) {
  try {
    const { amount, currency, provider, swiftCode, recipientAccountInfo } = req.body;
    const customerId = req.user.id;

    // Validate provided SWIFT code
    if (swiftCode && !SWIFT_REGEX.test(swiftCode.trim().toUpperCase())) {
      return res.status(400).json({
        message: "Invalid SWIFT/BIC code format"
      });
    }

    const finalSwiftCode = swiftCode?.trim() !== "" ? 
      swiftCode.trim().toUpperCase() : 
      generateSwiftCode();

    const sanitizeInput = (str) => {
      return str.toString()
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .substring(0, 200);
    };

    const newTransaction = new Transaction({
      customer: customerId,
      amount: parseFloat(amount).toFixed(2),
      currency: currency.toUpperCase(),
      provider: sanitizeInput(provider),
      swiftCode: finalSwiftCode,
      recipientAccountInfo: {
        accountName: sanitizeInput(recipientAccountInfo.accountName),
        accountNumber: recipientAccountInfo.accountNumber.replace(/\D/g, ''),
        bankName: sanitizeInput(recipientAccountInfo.bankName)
      },
      status: 'pending'
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: savedTransaction,
      swiftCode: finalSwiftCode
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
}

// Get user's transactions
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

    if (req.user.role !== 'admin' && transaction.customer.toString() !== req.user.id) {
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

// Verify transaction (admin only) - Updated validation
async function verifyTransaction(req, res) {
  try {
    const { transactionId } = req.params;
    const { action, verificationNotes } = req.body;

    if (!['completed', 'rejected'].includes(action)) {
      return res.status(400).json({ message: "Invalid action specified" });
    }

    if (verificationNotes && !NOTES_REGEX.test(verificationNotes)) {
      return res.status(400).json({
        message: "Invalid characters in verification notes"
      });
    }

    if(verificationNotes && verificationNotes.length > 200) {
      return res.status(400).json({ message: "Notes exceed 200 characters" });
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
    transaction.verificationNotes = verificationNotes.replace(/[<>]/g, '');

    await transaction.save();
    res.json({ message: `Transaction ${action}`, transaction });
  } catch (error) {
    res.status(500).json({ message: "Error verifying transaction" });
  }
}

// Validate SWIFT Code (admin only) - Enhanced validation
async function validateSwiftCode(req, res) {
  try {
    const { swiftCode } = req.body;
    if (!swiftCode) {
      return res.status(400).json({ message: "SWIFT code is required" });
    }
    
    const cleanedSwift = swiftCode.trim().toUpperCase();
    const isValid = SWIFT_REGEX.test(cleanedSwift);
    
    res.json({
      valid: isValid,
      message: isValid ? "Valid SWIFT/BIC code" : "Invalid SWIFT/BIC format",
      swiftCode: cleanedSwift
    });
  } catch (error) {
    console.error('SWIFT validation error:', error);
    res.status(500).json({ 
      message: "Error validating SWIFT code",
      error: error.message
    });
  }
}

// Add the validation middleware to exports
module.exports = {
  validateTransactionInput,
  createTransaction,
  getMyTransactions,
  getTransactionById,
  getPendingTransactions,
  verifyTransaction,
  validateSwiftCode
};
