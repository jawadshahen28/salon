import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing from .env');
    }

    if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1') || mongoUri.includes('27017')) {
      throw new Error('Local MongoDB connection is not allowed. Use MongoDB Atlas in MONGODB_URI.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
