const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const SessionActivity = require('../models/SessionActivity');
const cors = require('cors');
const crypto = require('crypto');
const User = require('../models/user');

// Security headers
exports.securityHeaders = (req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'", `'nonce-${nonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"]
      }
    }
  })(req, res, next);
};

// Rate limiting
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => req.ipReputation?.score > 0.7 ? 100 : 50,
  message: 'Too many requests',
  validate: { trustProxy: false }
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts'
});

exports.userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => req.user ? 1000 : 100,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Session validation
exports.sessionValidation = async (req, res, next) => {
  // Add early return for unauthenticated requests
  if (!req.user) return next();

  const clientFingerprint = crypto.createHash('sha256')
    .update(`${req.ip}${req.headers['user-agent']}`)
    .digest('hex');

  if(req.cookies.sessionFingerprint !== clientFingerprint) {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { sessions: [] } }
    );
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