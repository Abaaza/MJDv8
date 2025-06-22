export default async function handler(req, res) {
  try {
    // First, let's just check environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    // Basic environment debug
    const debug = {
      mongoUriExists: !!mongoUri,
      mongoUriFormat: mongoUri ? 'mongodb+srv format' : 'not set',
      environment: process.env.VERCEL ? 'vercel' : 'local',
      nodeVersion: process.version,
      allEnvVars: Object.keys(process.env).filter(key => 
        key.includes('MONGO') || key.includes('mongo')
      )
    };
    
    console.log('🔍 Environment Debug:', debug);
    
    if (!mongoUri) {
      return res.status(500).json({
        error: 'MONGODB_URI environment variable not set',
        debug
      });
    }
    
    // Try to import MongoDB driver dynamically
    let MongoClient;
    try {
      const mongodb = await import('mongodb');
      MongoClient = mongodb.MongoClient;
      console.log('✅ MongoDB driver imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import MongoDB driver:', importError);
      return res.status(500).json({
        error: 'Failed to import MongoDB driver',
        details: importError.message,
        debug
      });
    }
    
    // Test connection
    console.log('🔌 Attempting MongoDB connection...');
    
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Test ping
    const result = await client.db().command({ ping: 1 });
    console.log('✅ Database ping successful:', result);
    
    // Get connection info
    const admin = client.db().admin();
    const serverStatus = await admin.command({ hello: 1 });
    
    await client.close();
    console.log('📤 Disconnected successfully');
    
    res.status(200).json({
      success: true,
      message: 'MongoDB connection successful!',
      debug,
      connectionInfo: {
        host: serverStatus.me,
        isWritablePrimary: serverStatus.isWritablePrimary,
        maxWireVersion: serverStatus.maxWireVersion
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        type: error.constructor.name,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5), // First 5 lines only
        mongoUriExists: !!process.env.MONGODB_URI
      }
    });
  }
} 