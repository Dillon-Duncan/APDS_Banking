const express = require('express'); 
const signUpRoute = require('./routes/signUp');
const loginRoute = require('./routes/login');
const authenticatedRoute = require('./routes/authenticated');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createAdminAccount } = require('./scripts/admin');
const transactionRoute = require('./routes/transaction');

const app = express();

// Add detailed request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

createAdminAccount();

// Mount routes individually for better control
app.use('/api/auth', signUpRoute);     // /api/auth/register
app.use('/api/auth', loginRoute);      // /api/auth/login
app.use('/api/auth', authenticatedRoute); // /api/auth/profile
app.use('/api/transaction', transactionRoute);

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Debug route to check all registered routes
app.get('/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push({
                        path: '/api/auth' + handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json(routes);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// 404 handler with detailed logging
app.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    res.status(404).json({ 
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Print all routes on startup
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    console.log('- GET /api/auth/profile');
    console.log('- GET /api/test');
    console.log('- GET /debug/routes');
});