const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/apdsDB', {
  serverSelectionTimeoutMS: 5000
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.log('MongoDB Connection error', error);
});

module.exports = mongoose;