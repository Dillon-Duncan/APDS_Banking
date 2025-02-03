const express = require('express');
const router = express.Router();
const authenticateToken = require('../utils/authMiddleware');
const { getUser } = require('../controllers/authenticated');

console.log('Setting up authenticated routes');

router.get('/profile', authenticateToken, getUser);

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
