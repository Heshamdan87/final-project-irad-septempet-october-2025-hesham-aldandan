const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Only log in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    }
    

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log('MongoDB disconnected');
      }
    });








  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);

  }
};

module.exports = connectDB;


