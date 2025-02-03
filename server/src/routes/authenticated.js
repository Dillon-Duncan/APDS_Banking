const express = require('express');
const router = express.Router();
const { getUser } = require('../controller/authenticated');
const authenticateToken = require('../utils/authMiddleware');

// Remove /profile since we're mounting under /api/auth
router.get('/profile', authenticateToken, getUser);

module.exports = router;
