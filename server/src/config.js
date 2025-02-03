require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mongoDB',
  JWT_SECRET: (() => {
    if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
    return process.env.JWT_SECRET;
  })(),
  CSRF_SECRET: (() => {
    if(!process.env.CSRF_SECRET) throw new Error('CSRF_SECRET not configured');
    return process.env.CSRF_SECRET;
  })(),
  NODE_ENV: process.env.NODE_ENV || 'development',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'mrduncan.dillonjo@gmail.com',
  ADMIN_INITIAL_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD || 'Admin321?',
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100
};

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  options: { expiresIn: '1h' }
};

module.exports.JWT_CONFIG = JWT_CONFIG; 