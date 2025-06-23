// Health check endpoint for debugging processing function
import { PriceMatchingService } from '../server/services/PriceMatchingService.js';
import VercelBlobService from '../server/services/VercelBlobService.js';

export default async function handler(req, res) {
  console.log('🔍 [HEALTH] Processing function health check started');
  
  const healthCheck = {
    timestamp: new Date().toISOString(),
    environment: {
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      supabaseUrlPreview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 50) + '...' : 'undefined',
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
    },
    services: {
      priceMatchingService: { status: 'unknown', error: null },
      supabaseConnection: { status: 'unknown', error: null },
      vercelBlob: { status: 'unknown', error: null }
    }
  };

  // Test PriceMatchingService initialization
  try {
    console.log('🔍 [HEALTH] Testing PriceMatchingService...');
    const priceMatchingService = new PriceMatchingService();
    healthCheck.services.priceMatchingService.status = 'healthy';
    console.log('✅ [HEALTH] PriceMatchingService created successfully');
    
    // Test Supabase connection
    try {
      console.log('🔍 [HEALTH] Testing Supabase connection...');
      const { data, error } = await priceMatchingService.supabase
        .from('ai_matching_jobs')
        .select('id')
        .limit(1);
      
      if (error) {
        healthCheck.services.supabaseConnection.status = 'unhealthy';
        healthCheck.services.supabaseConnection.error = error.message;
        console.error('❌ [HEALTH] Supabase connection failed:', error);
      } else {
        healthCheck.services.supabaseConnection.status = 'healthy';
        console.log('✅ [HEALTH] Supabase connection successful');
      }
    } catch (dbError) {
      healthCheck.services.supabaseConnection.status = 'error';
      healthCheck.services.supabaseConnection.error = dbError.message;
      console.error('❌ [HEALTH] Supabase connection error:', dbError);
    }
    
  } catch (serviceError) {
    healthCheck.services.priceMatchingService.status = 'unhealthy';
    healthCheck.services.priceMatchingService.error = serviceError.message;
    console.error('❌ [HEALTH] PriceMatchingService creation failed:', serviceError);
  }

  // Test Vercel Blob
  try {
    console.log('🔍 [HEALTH] Testing Vercel Blob...');
    // VercelBlobService is exported as a singleton instance, not a class
    if (VercelBlobService && typeof VercelBlobService.uploadFile === 'function') {
      healthCheck.services.vercelBlob.status = 'healthy';
      console.log('✅ [HEALTH] Vercel Blob service available');
    } else {
      healthCheck.services.vercelBlob.status = 'unhealthy';
      healthCheck.services.vercelBlob.error = 'VercelBlobService methods not available';
      console.error('❌ [HEALTH] Vercel Blob service methods not available');
    }
  } catch (blobError) {
    healthCheck.services.vercelBlob.status = 'unhealthy';
    healthCheck.services.vercelBlob.error = blobError.message;
    console.error('❌ [HEALTH] Vercel Blob service error:', blobError);
  }

  console.log('🔍 [HEALTH] Health check completed:', healthCheck);

  // Determine overall status
  const allServicesHealthy = Object.values(healthCheck.services).every(
    service => service.status === 'healthy'
  );

  res.status(allServicesHealthy ? 200 : 503).json({
    status: allServicesHealthy ? 'healthy' : 'unhealthy',
    ...healthCheck
  });
} 