const mongoose = require("../config/dbConfig");

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
        match: /^\d+(\.\d{1,2})?$/  // Positive number with up to 2 decimal places
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
        match: /^[A-F0-9]{8}$/
    },
    recipientAccountInfo: {
        accountName: {
            type: String,
            required: true,
            match: /^[a-zA-Z\s]{2,50}$/  // Letters and spaces, 2-50 chars
        },
        accountNumber: {
            type: String,
            required: true,
            match: /^[0-9]{10,20}$/  // 10-20 digit account number
        },
        bankName: {
            type: String,
            required: true,
            match: /^[a-zA-Z\s\-&]{2,100}$/  // Letters, spaces, hyphens, &, 2-100 chars
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
transactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema); 