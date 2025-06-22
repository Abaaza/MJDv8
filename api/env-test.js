export default async function handler(req, res) {
  try {
    // Check environment variables without any imports
    const mongoUri = process.env.MONGODB_URI;
    
    const debug = {
      mongoUriExists: !!mongoUri,
      mongoUriStartsWith: mongoUri ? mongoUri.substring(0, 20) + '...' : 'not set',
      environment: process.env.VERCEL ? 'vercel' : 'local',
      nodeVersion: process.version,
      platform: process.platform,
      allMongoVars: Object.keys(process.env).filter(key => 
        key.toLowerCase().includes('mongo')
      ),
      totalEnvVars: Object.keys(process.env).length
    };
    
    console.log('🔍 Environment Debug:', debug);
    
    if (!mongoUri) {
      return res.status(500).json({
        error: 'MONGODB_URI environment variable not set',
        debug,
        suggestion: 'Add MONGODB_URI to Vercel environment variables'
      });
    }
    
    // Basic validation of the URI format
    const isValidFormat = mongoUri.startsWith('mongodb+srv://') || mongoUri.startsWith('mongodb://');
    
    res.status(200).json({
      success: true,
      message: 'Environment variables are properly set!',
      debug: {
        ...debug,
        uriFormatValid: isValidFormat,
        uriLength: mongoUri.length
      }
    });
    
  } catch (error) {
    console.error('❌ Environment test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        type: error.constructor.name,
        stack: error.stack?.split('\n').slice(0, 3)
      }
    });
  }
} 