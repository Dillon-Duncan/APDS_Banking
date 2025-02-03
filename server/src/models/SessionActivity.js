const mongoose = require("../config/dbConfig");

const sessionActivitySchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400
  },
  lastActivity: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("SessionActivity", sessionActivitySchema); 