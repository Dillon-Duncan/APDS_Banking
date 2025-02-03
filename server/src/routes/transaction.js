const express = require('express');
const transactionController = require('../controller/transaction');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// Customer transaction routes
router.get('/my-transactions', authMiddleware, transactionController.getCustomerTransactions);
router.post('/create', authMiddleware, transactionController.createTransaction);
router.get('/:id', authMiddleware, transactionController.getTransactionById);

// Admin transaction routes
router.get('/admin/pending', [authMiddleware, adminMiddleware], transactionController.getPendingTransactions);
router.post('/admin/verify/:transactionId', [authMiddleware, adminMiddleware], transactionController.verifyTransaction);

module.exports = router; 