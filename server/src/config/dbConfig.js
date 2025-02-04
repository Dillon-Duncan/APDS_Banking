const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apdsDB';

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000
}).catch(err => {
  console.error('MongoDB initial connection error:', err);
  process.exit(1); // Fail fast if no DB connection
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.log('MongoDB Connection error', error);
});

// Add reconnect handler
mongoose.connection.on('reconnected', async () => {
  console.log('MongoDB reconnected');
  await createAdminAccount();
});

module.exports = mongoose;