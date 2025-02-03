const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transaction');
const authenticateToken = require('../utils/authMiddleware');
const adminMiddleware = require('../middleware/admin');

// Customer routes
router.get('/my-transactions', authenticateToken, transactionController.getMyTransactions);
router.post('/create', authenticateToken, transactionController.createTransaction);
router.get('/:id', authenticateToken, transactionController.getTransactionById);

// Admin routes (protected by both authenticateToken and adminMiddleware)
router.get('/admin/pending', authenticateToken, adminMiddleware, transactionController.getPendingTransactions);
router.post('/admin/verify/:transactionId', authenticateToken, adminMiddleware, transactionController.verifyTransaction);

module.exports = router;