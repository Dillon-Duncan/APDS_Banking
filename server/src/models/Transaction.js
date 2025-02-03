const mongoose = require("../config/dbConfig");
const { NAME_REGEX, ACCOUNT_REGEX, SWIFT_REGEX, CURRENCIES } = require("../utils/validations");

const transactionSchema = new mongoose.Schema({
  // Customer Information (referenced from User model)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive'],
    // Note: Regex validation for decimals is optional
    match: /^\d+(\.\d{1,2})?$/
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'RUB', 'ZAR', 'CNY'],
    required: true
  },
  provider: {
    type: String,
    enum: [
      'ABSA Bank',
      'Capitec Bank',
      'First National Bank',
      'Nedbank',
      'Standard Bank',
      'African Bank',
      'Investec Bank',
      'TymeBank',
      'Discovery Bank',
      'Bank Zero'
    ],
    required: true
  },

  // SWIFT Payment Details
  swiftCode: {
    type: String,
    required: true,
    // We remove the strict regex so admins can validate manually.
    // If you wish, you can uncomment the following line to enforce strict validation.
    // match: /^[A-Z0-9]{8}$/
  },
  recipientAccountInfo: {
    accountName: {
      type: String,
      required: true,
      set: (v) => v.trim().replace(/[<>]/g, ''),
      match: NAME_REGEX
    },
    accountNumber: {
      type: String,
      required: true,
      set: (v) => v.replace(/\s/g, ''),
      match: ACCOUNT_REGEX
    },
    bankName: {
      type: String,
      required: true,
      set: (v) => v.trim().replace(/[<>]/g, ''),
      match: NAME_REGEX
    }
  },

  // Transaction Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending'
  },

  // Employee Verification
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verificationNotes: {
    type: String,
    default: ""
  },
  verificationDate: {
    type: Date,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
transactionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  // Sanitize all string fields
  this.provider = this.provider.replace(/[<>]/g, '');
  this.swiftCode = this.swiftCode.replace(/[^A-Z0-9]/g, '');
  
  if(this.recipientAccountInfo) {
    this.recipientAccountInfo.accountName = this.recipientAccountInfo.accountName
      .replace(/[<>]/g, '')
      .substring(0, 50);
    this.recipientAccountInfo.accountNumber = this.recipientAccountInfo.accountNumber
      .replace(/\D/g, '')
      .substring(0, 20);
  }
  
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
