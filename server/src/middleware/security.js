const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const SessionActivity = require('../models/SessionActivity');
const cors = require('cors');

// Security headers
exports.securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'http://localhost:5000']
    }
  },
  hsts: {
    maxAge: 63072000, // 2 years in seconds
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  noSniff: true,
  xssFilter: true
});

// Rate limiting
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  validate: { trustProxy: false }
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts'
});

// Session validation
exports.sessionValidation = (req, res, next) => {
  const clientIP = req.ip;
  const sessionIP = req.cookies.sessionIP;
  
  if (!sessionIP) {
    res.cookie('sessionIP', clientIP, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 15 * 60 * 1000
    });
    return next();
  }

  if (sessionIP !== clientIP) {
    return res.status(401).clearCookie('token').json({ 
      message: "Session validation failed" 
    });
  }
  next();
};

// Session activity monitoring
exports.sessionActivityMonitor = (req, res, next) => {
  if (req.cookies.token) {
    SessionActivity.updateOne(
      { token: req.cookies.token },
      { 
        $set: { lastActivity: new Date() },
        $setOnInsert: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      },
      { upsert: true }
    ).catch(console.error);
  }
  next();
};

// Add feature policy
exports.frameguard = helmet.frameguard({ action: 'deny' });
exports.referrerPolicy = helmet.referrerPolicy({ policy: 'same-origin' });

// CORS configuration
exports.corsConfig = cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
});