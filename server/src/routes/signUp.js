const express = require('express');
const signUpController = require('../controller/signUp');
const router = express.Router();

router.post('/register', signUpController.createUser);
module.exports = router;