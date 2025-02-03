const express = require('express');
const loginController = require('../controller/login');
const authenticateToken = require('../utils/authMiddleware');

const router = express.Router();

// Auth routes - remove /auth prefix since we're mounting under /api
router.post('/login', loginController.login);
router.get('/profile', authenticateToken, loginController.getProfile);

module.exports = router;