require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mongoDB',
  JWT_SECRET: process.env.JWT_SECRET || 'e4a1f3b5c7d9e2a3b4c6d8f0a1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a1b3c5d7e9f2',
  CSRF_SECRET: process.env.CSRF_SECRET || '3e8f2d9a7b4c1f0e2d3c4b5a6f7d8e9c0b1a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'mrduncan.dillonjo@gmail.com',
  ADMIN_INITIAL_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD || 'Admin321?',
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100
}; 