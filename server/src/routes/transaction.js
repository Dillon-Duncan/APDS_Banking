const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction');
const authenticateToken = require('../utils/authMiddleware');
const adminMiddleware = require('../middleware/admin');
const adminCheck = require('../middleware/adminCheck');

router.get('/my-transactions', authenticateToken, transactionController.getMyTransactions);
router.post('/create', authenticateToken, transactionController.validateTransactionInput, transactionController.createTransaction);
router.get('/:id', authenticateToken, transactionController.getTransactionById);

router.get('/admin/pending', authenticateToken, adminMiddleware, transactionController.getPendingTransactions);
router.post('/admin/verify/:transactionId', authenticateToken, adminCheck, transactionController.verifyTransaction);
router.post('/admin/validate-swift/:transactionId', authenticateToken, adminCheck, transactionController.validateSwiftCode);

module.exports = router;
