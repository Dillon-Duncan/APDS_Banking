const mongoose = require("../config/dbConfig");
const { HIGH_RISK_COUNTRIES, NAME_REGEX, ACCOUNT_REGEX, SWIFT_REGEX, CURRENCIES } = require("../constants/validation");

const transactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive'],
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
  swiftCode: {
    type: String,
    required: true
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
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending'
  },
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
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  this.provider = this.provider.replace(/[<>]/g, '');
  this.swiftCode = this.swiftCode?.replace(/[^A-Z0-9]/g, '') || '';
  
  if(this.recipientAccountInfo) {
    this.recipientAccountInfo.accountName = this.recipientAccountInfo.accountName
      .replace(/[<>]/g, '')
      .substring(0, 50);
    this.recipientAccountInfo.accountNumber = this.recipientAccountInfo.accountNumber
      .replace(/\D/g, '')
      .substring(0, 20);
  }
  
  const similarTransactions = await this.constructor.find({
    $or: [
      { 'recipientAccountInfo.accountNumber': this.recipientAccountInfo.accountNumber },
      { 'recipientAccountInfo.bankName': this.recipientAccountInfo.bankName }
    ],
    status: 'rejected'
  });
  
  this.riskScore = Math.min(
    similarTransactions.length * 15 +
    (this.amount > 5000 ? 20 : 0) +
    (HIGH_RISK_COUNTRIES.includes(this.recipientCountry) ? 30 : 0),
    100
  );
  
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
