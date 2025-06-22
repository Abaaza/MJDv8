import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    // Debug environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    console.log('🔍 Environment Debug:');
    console.log('- MONGODB_URI exists:', !!mongoUri);
    console.log('- MONGODB_URI starts with mongodb+srv:', mongoUri?.startsWith('mongodb+srv://'));
    console.log('- Environment:', process.env.VERCEL ? 'vercel' : 'local');
    console.log('- Node version:', process.version);
    
    if (!mongoUri) {
      return res.status(500).json({
        error: 'MONGODB_URI environment variable not set',
        debug: {
          env: process.env.VERCEL ? 'vercel' : 'local',
          envVars: Object.keys(process.env).filter(key => key.includes('MONGO'))
        }
      });
    }

    // Test connection with simplified options
    console.log('🔌 Attempting MongoDB connection...');
    
    const connection = await mongoose.connect(mongoUri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      bufferCommands: false
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test ping
    await connection.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Clean up
    await mongoose.disconnect();
    console.log('📤 Disconnected successfully');
    
    res.status(200).json({
      success: true,
      message: 'MongoDB connection successful!',
      details: {
        host: connection.connection.host,
        database: connection.connection.name,
        environment: process.env.VERCEL ? 'vercel' : 'local',
        nodeVersion: process.version
      }
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        type: error.constructor.name,
        code: error.code,
        environment: process.env.VERCEL ? 'vercel' : 'local',
        mongoUriExists: !!process.env.MONGODB_URI,
        reason: error.reason?.type || 'Unknown'
      }
    });
  }
} 