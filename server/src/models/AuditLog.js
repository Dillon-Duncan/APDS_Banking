const mongoose = require('../config/dbConfig');

const auditLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['login_attempt', 'transaction', 'admin_action', 'fraud_attempt']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String,
  outcome: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'pending']
  },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add indexes
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, outcome: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema); 