const express = require('express');
const loginController = require('../controllers/login');
const signUpController = require('../controllers/signUp');
const authenticateToken = require('../utils/authMiddleware');

const router = express.Router();

router.post('/login', loginController.login);
router.post('/signup', signUpController.createUser);
router.get('/profile', authenticateToken, loginController.getProfile);

module.exports = router;