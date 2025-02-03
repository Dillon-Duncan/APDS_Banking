const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// Security headers
exports.securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
});

// Rate limiting
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many attempts, please try again later',
  keyGenerator: (req) => req.ip + '-' + (req.get('X-Client-ID') || uuidv4())
});

// CSRF protection
exports.csrfProtection = (req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  });
  next();
}; 