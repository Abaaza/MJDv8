// Simple test endpoint to verify processing function infrastructure
export default async function handler(req, res) {
  console.log(`🧪 [TEST-PROCESS] Test endpoint called with method: ${req.method}`);
  console.log(`🧪 [TEST-PROCESS] Request body:`, req.body);
  console.log(`🧪 [TEST-PROCESS] Environment check:`, {
    isVercel: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
  });

  if (req.method === 'POST') {
    const { jobId } = req.body;
    console.log(`🧪 [TEST-PROCESS] Received test request for job: ${jobId}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`🧪 [TEST-PROCESS] Test processing completed for job: ${jobId}`);
    
    res.json({
      success: true,
      message: 'Test processing function works',
      jobId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 