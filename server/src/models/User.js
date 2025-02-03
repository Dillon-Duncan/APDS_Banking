const mongoose = require("../config/dbConfig");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  sessions: [{
    token: String,
    ip: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now }
  }],
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  mfaSecret: String,
  lastPasswordChange: Date,
  securityQuestions: [{
    question: String,
    hash: String
  }],
  first_name: {
    type: String,
    required: true,
    match: /^[A-Za-z\s]{2,50}$/
  },
  last_name: {
    type: String,
    required: true,
    match: /^[A-Za-z\s]{2,50}$/
  },
  id_number: {
    type: String,
    required: true,
    match: /^[0-9]{13}$/
  },
  account_number: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  username: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9_]{3,20}$/,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "customer"],
    default: "customer"
  },
  accountType: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);