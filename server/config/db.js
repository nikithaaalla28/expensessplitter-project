const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error('MongoDB Error: MONGO_URL is not set in server/.env');
  process.exit(1);
}

mongoose.set('strictQuery', false);

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message || err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from MongoDB Atlas');
});

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
      family: 4,
      autoIndex: false,
    });
    console.log('MongoDB Atlas connection established');
  } catch (error) {
    console.error('MongoDB Atlas connection failed:', error.message || error);
    throw error;
  }
};

module.exports = connectDB;
