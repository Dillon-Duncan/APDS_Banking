const express = require('express');
const loginController = require('../controller/login');
const authenticateToken = require('../utils/authMiddleware');

const router = express.Router();

// Only handle login
router.post('/login', loginController.login);

module.exports = router;