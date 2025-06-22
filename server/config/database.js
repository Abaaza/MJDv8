import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mjd-auth';

// Simplified MongoDB connection options for serverless (similar to working API functions)
const options = {
  maxPoolSize: 1, // Single connection for serverless
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  bufferCommands: false, // Disable buffering to match API function behavior
};

// Connection state management
let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📦 Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('🔍 MongoDB URI exists:', !!MONGODB_URI);
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Simple connection without event listeners for serverless
    const connection = await mongoose.connect(MONGODB_URI, options);
    
    isConnected = true;
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    
    // Simple error handler
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
      isConnected = false;
    });

    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      type: error.constructor.name
    });
    isConnected = false;
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('📦 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Health check function
export const checkDBHealth = async () => {
  try {
    if (!isConnected) {
      throw new Error('Database not connected');
    }

    // Simple ping to check connection
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message
    };
  }
};

// Get connection info
export const getConnectionInfo = () => {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models)
  };
};

export default { connectDB, disconnectDB, checkDBHealth, getConnectionInfo }; 