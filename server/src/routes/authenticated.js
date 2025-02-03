const express = require('express');
const router = express.Router();
const authenticateToken = require('../utils/authMiddleware');
const { getUser } = require('../controller/authenticated');

console.log('Setting up authenticated routes');

// Single responsibility - handle profile route
router.get('/profile', authenticateToken, getUser);

// Debug endpoint
router.get('/debug', (req, res) => {
    res.json({
        message: 'Authenticated routes are working',
        routes: router.stack.map(r => ({
            path: r.route?.path,
            methods: r.route?.methods
        }))
    });
});

module.exports = router;
