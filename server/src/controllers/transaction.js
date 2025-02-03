const Transaction = require('../models/Transaction');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const AuditLog = require('../models/AuditLog');
const { 
  HIGH_RISK_COUNTRIES,
  SWIFT_REGEX,
  NOTES_REGEX,
  RISK_THRESHOLD
} = require('../constants/validation');

const validateTransactionInput = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Invalid amount'),
  body('currency').isISO4217().withMessage('Invalid currency code'),
  body('recipientAccountInfo.accountNumber')
    .isLength({ min: 10, max: 20 }).withMessage('Invalid account number length'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const fraudDetection = async (req, transaction, user) => {
  const riskFactors = {
    countryRisk: 0,
    amountRisk: 0,
    velocityRisk: 0,
    historicalRisk: 0
  };

  const swiftCountry = transaction.swiftCode?.substring(4, 6);
  riskFactors.countryRisk = HIGH_RISK_COUNTRIES.includes(swiftCountry) ? 30 : 0;

  if (transaction.amount > 5000) {
    riskFactors.amountRisk = Math.min((transaction.amount - 5000) / 100, 50);
  }

  const dailyTransactions = await Transaction.countDocuments({
    customer: user.id,
    createdAt: { $gte: new Date(Date.now() - 86400000) }
  });
  riskFactors.velocityRisk = dailyTransactions > 15 ? 30 : 0;

  const similarRejections = await Transaction.countDocuments({
    'recipientAccountInfo.accountNumber': transaction.recipientAccountInfo.accountNumber,
    status: 'rejected'
  });
  riskFactors.historicalRisk = similarRejections * 10;

  const totalRisk = Object.values(riskFactors).reduce((a, b) => a + b, 0);
  
  await AuditLog.create({
    eventType: 'fraud_attempt',
    userId: user.id,
    ipAddress: req.ip,
    outcome: totalRisk < RISK_THRESHOLD ? 'success' : 'failed',
    metadata: {
        riskScore: totalRisk,
        factors: riskFactors,
        transactionId: transaction._id
    }
  });

  return {
    valid: totalRisk < RISK_THRESHOLD,
    riskScore: totalRisk,
    reason: totalRisk >= RISK_THRESHOLD ? 'High risk transaction detected' : ''
  };
};

async function createTransaction(req, res) {
  try {
    const { amount, currency, provider, swiftCode, recipientAccountInfo } = req.body;
    const customerId = req.user.id;

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

async function getMyTransactions(req, res) {
  try {
    const customerId = req.user.id;
    const transactions = await Transaction.find({ customer: customerId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
}

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

    const fraudCheck = await fraudDetection(req, transaction, req.user);
    if (!fraudCheck.valid) {
      await AuditLog.create({
        eventType: 'fraud_attempt',
        userId: req.user.id,
        ipAddress: req.ip,
        outcome: 'failed',
        metadata: { reason: fraudCheck.reason }
      });
      return res.status(403).json({ message: fraudCheck.reason });
    }

    transaction.status = action;
    transaction.verifiedBy = req.user.id;
    transaction.verificationDate = Date.now();
    transaction.verificationNotes = verificationNotes.replace(/[<>]/g, '');

    await transaction.save();
    await AuditLog.create({
      eventType: 'transaction',
      userId: req.user.id,
      ipAddress: req.ip,
      outcome: 'success',
      metadata: {
        riskScore: fraudCheck.riskScore,
        transactionId: transaction._id
      }
    });
    res.json({ message: `Transaction ${action}`, transaction });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      message: "Transaction verification failed",
      error: error.message
    });
  }
}

async function validateSwiftCode(req, res) {
  try {
    const { swiftCode } = req.body;
    if (!swiftCode) {
      return res.status(400).json({ message: "SWIFT code is required" });
    }
    
    const cleanedSwift = swiftCode.trim().toUpperCase();
    const isValid = SWIFT_REGEX.test(cleanedSwift);
    
    const countryCode = cleanedSwift.substring(4, 6);
    if(HIGH_RISK_COUNTRIES.includes(countryCode)) {
      return res.json({
        valid: false,
        message: "SWIFT code from restricted country"
      });
    }

    if(cleanedSwift.length !== 8 && cleanedSwift.length !== 11) {
      return res.json({
        valid: false,
        message: "Invalid SWIFT code length"
      });
    }
    
    if (!isValid) {
      return res.json({
        valid: false,
        message: "Invalid SWIFT/BIC format"
      });
    }
    
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

module.exports = {
  validateTransactionInput,
  createTransaction,
  getMyTransactions,
  getTransactionById,
  getPendingTransactions,
  verifyTransaction,
  validateSwiftCode,
  fraudDetection
};
