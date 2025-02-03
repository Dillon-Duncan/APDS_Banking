const express = require('express'); 
const signUpRoute = require('./routes/signUp');
const loginRoute = require('./routes/login');
const authenticatedRoute = require('./routes/authenticated');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createAdminAccount } = require('./scripts/admin');
const transactionRoute = require('./routes/transaction');

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

createAdminAccount();

// Mount all routes under /api/auth
app.use('/api/auth', signUpRoute);      // handles /api/auth/register
app.use('/api/auth', loginRoute);       // handles /api/auth/login
app.use('/api/auth', authenticatedRoute); // handles /api/auth/profile
app.use('/api/transaction', transactionRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);  
});