import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrivision';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Remove deprecated options for newer mongoose versions
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Make sure MongoDB is running or check your MONGODB_URI in .env file');
    console.error('⚠️  Server will continue without MongoDB (using in-memory storage)');
    console.error('💡 To use MongoDB:');
    console.error('   1. Install MongoDB locally, OR');
    console.error('   2. Set MONGODB_URI in .env file for MongoDB Atlas');
    // Don't exit - let server run without MongoDB for now
    return null;
  }
};

export default connectDB;

