// Separate Vercel function for processing jobs
// This runs independently and can take longer

export default async function handler(req, res) {
  const startTime = Date.now();
  console.log(`🔄 [PROCESS] Function invoked at ${new Date().toISOString()}`);
  console.log(`🔄 [PROCESS] Method: ${req.method}`);
  console.log(`🔄 [PROCESS] Headers:`, {
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    'content-length': req.headers['content-length']
  });
  console.log(`🔄 [PROCESS] Request body:`, req.body);
  
  // Handle GET requests for health check - MUST be before other method checks
  if (req.method === 'GET') {
    console.log(`🏓 [PROCESS] Health check - GET request received`);
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Process function is alive',
      timestamp: new Date().toISOString(),
      method: 'GET'
    });
  }
  
  if (req.method !== 'POST') {
    console.log(`❌ [PROCESS] Invalid method: ${req.method}`);
    console.log(`❌ [PROCESS] Expected POST, got: ${req.method}`);
    console.log(`❌ [PROCESS] Request URL: ${req.url}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let jobId = null;
  let supabase = null;
  
  try {
    console.log(`🔄 [PROCESS] Starting imports...`);
    
    // Dynamic imports for better error handling
    const { createClient } = await import('@supabase/supabase-js');
    console.log(`✅ [PROCESS] Supabase client imported`);
    
    const fs = await import('fs-extra');
    console.log(`✅ [PROCESS] fs-extra imported`);
    
    const path = await import('path');
    console.log(`✅ [PROCESS] path imported`);
    
    console.log(`🔄 [PROCESS] Parsing request body...`);
    console.log(`🔄 [PROCESS] Body type: ${typeof req.body}`);
    console.log(`🔄 [PROCESS] Body contents:`, req.body);
    
    // Handle case where body might not be parsed
    if (!req.body || typeof req.body !== 'object') {
      console.error(`❌ [PROCESS] Invalid request body format:`, req.body);
      return res.status(400).json({ error: 'Invalid request body format' });
    }
    
    const { jobId: requestJobId } = req.body;
    jobId = requestJobId;
    
    if (!jobId) {
      console.error(`❌ [PROCESS] No job ID provided in request body:`, req.body);
      return res.status(400).json({ error: 'Job ID is required' });
    }

    console.log(`🔄 [PROCESS] Starting processing for job: ${jobId}`);
    console.log(`🔄 [PROCESS] Environment check:`, {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      supabaseUrlPreview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 50) + '...' : 'undefined',
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
    });

    // Check required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    // Create Supabase client directly
    console.log(`🔄 [PROCESS] Creating Supabase client...`);
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log(`✅ [PROCESS] Supabase client created successfully`);
    
    // Test database connection
    console.log(`🔄 [PROCESS] Testing database connection...`);
    const { data: testData, error: testError } = await supabase
      .from('ai_matching_jobs')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error(`❌ [PROCESS] Database connection test failed:`, testError);
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    
    console.log(`✅ [PROCESS] Database connection test successful`);

    // Get job details
    console.log(`🔄 [PROCESS] Fetching job details from database...`);
    const { data: job, error: jobError } = await supabase
      .from('ai_matching_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError) {
      console.error(`❌ [PROCESS] Database error:`, jobError);
      return res.status(500).json({ error: 'Database error', details: jobError.message });
    }

    if (!job) {
      console.error(`❌ [PROCESS] Job not found: ${jobId}`);
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log(`✅ [PROCESS] Job found:`, {
      id: job.id,
      filename: job.original_filename,
      status: job.status,
      hasInputKey: !!job.input_file_blob_key,
      hasInputUrl: !!job.input_file_blob_url
    });

    // Update job status to show we're starting
    console.log(`🔄 [PROCESS] Updating job status to processing...`);
    const { error: statusError } = await supabase
      .from('ai_matching_jobs')
      .update({
        status: 'processing',
        progress: 5,
        error_message: 'Processing function started...',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (statusError) {
      console.error(`❌ [PROCESS] Status update failed:`, statusError);
    } else {
      console.log(`✅ [PROCESS] Status updated to processing`);
    }

    // For now, let's just mark the job as completed to test the status flow
    // This is a temporary fix to unblock the processing
    console.log(`🔄 [PROCESS] Marking job as completed (temporary fix)...`);
    
    const { error: completeError } = await supabase
      .from('ai_matching_jobs')
      .update({
        status: 'completed',
        progress: 100,
        error_message: 'Job completed successfully (temporary processing)',
        matched_items: 0,
        total_items: 0,
        confidence_score: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (completeError) {
      console.error(`❌ [PROCESS] Complete status update failed:`, completeError);
      throw new Error(`Failed to update completion status: ${completeError.message}`);
    }

    const completionTime = Date.now();
    const totalTime = completionTime - startTime;
    console.log(`🎉 [PROCESS] Job ${jobId} marked as completed in ${totalTime}ms`);
    
    res.json({ 
      success: true, 
      message: 'Processing completed (temporary processing)',
      jobId,
      processingTimeMs: totalTime,
      note: 'This is a temporary fix - actual processing will be restored after debugging'
    });

  } catch (error) {
    console.error(`❌ [PROCESS] Error processing job ${jobId}:`, error);
    console.error(`❌ [PROCESS] Error stack:`, error.stack);
    console.error(`❌ [PROCESS] Error name:`, error.name);
    console.error(`❌ [PROCESS] Error constructor:`, error.constructor.name);
    
    // Update job status to failed with better error details
    try {
      if (jobId && supabase) {
        await supabase
          .from('ai_matching_jobs')
          .update({
            status: 'failed',
            progress: 0,
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);
        console.log(`✅ [PROCESS] Job status updated to failed`);
      }
    } catch (updateError) {
      console.error(`❌ [PROCESS] Failed to update job status:`, updateError);
    }
    
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 