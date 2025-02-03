const AuditLog = require('../models/AuditLog');

exports.logSecurityEvent = async (req, eventType, outcome, metadata = {}) => {
  try {
    await AuditLog.create({
      eventType,
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      outcome,
      metadata
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}; 