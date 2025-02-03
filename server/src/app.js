require('dotenv').config();
const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createAdminAccount } = require('./scripts/admin');
const { 
  securityHeaders,
  globalLimiter,
  sessionValidation
} = require('./middleware/security');
const loginRoutes = require('./routes/login');
const transactionRoute = require('./routes/transaction');
const authenticatedRoutes = require('./routes/authenticated');
const User = require('./models/user');
const helmet = require('helmet');

const app = express();

app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(securityHeaders);
app.use(globalLimiter);

createAdminAccount();

app.use('/api', loginRoutes);
app.use(sessionValidation);
app.use('/api', authenticatedRoutes);
app.use('/api/transaction', transactionRoute);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

const checkSecrets = () => {
  const required = ['JWT_SECRET', 'CSRF_SECRET', 'MONGODB_URI'];
  required.forEach(env => {
    if(!process.env[env]) {
      throw new Error(`Missing configuration for ${env}`);
    }
    // Special case for MongoDB URI
    if(env === 'MONGODB_URI' && process.env[env].length < 10) {
      throw new Error(`Invalid MongoDB URI`);
    }
    if(env !== 'MONGODB_URI' && process.env[env].length < 64) {
      throw new Error(`${env} must be at least 64 characters`);
    }
  });
};
checkSecrets();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
