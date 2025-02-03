const cron = require('node-cron');
const Transaction = require('../models/Transaction');

cron.schedule('0 0 * * *', async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Transaction.deleteMany({
      status: 'pending',
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`Cleaned up ${result.deletedCount} old transactions`);
  } catch (error) {
    console.error('Transaction cleanup error:', error);
  }
}); 