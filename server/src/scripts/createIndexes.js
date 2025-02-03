const mongoose = require('mongoose');
const SessionActivity = require('../models/SessionActivity');

async function createSecurityIndexes() {
  try {
    await SessionActivity.createIndexes();
    console.log('Security indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    mongoose.disconnect();
  }
}

module.exports = { createSecurityIndexes }; 