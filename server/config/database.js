import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mjd-auth';

// MongoDB connection options
const options = {
  // Connection management
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  
  // Authentication
  authSource: 'admin',
  
  // Replica set / sharding
  retryWrites: true,
  w: 'majority'
};

// Connection state management
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('📦 Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Connect to MongoDB
    const connection = await mongoose.connect(MONGODB_URI, options);
    
    isConnected = true;
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('📦 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 Mongoose disconnected from MongoDB');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    isConnected = false;
    
    // Don't exit in serverless environments
    if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      process.exit(1);
    }
    
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