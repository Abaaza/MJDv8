// Separate Vercel function for processing jobs
// This runs independently and can take longer

import { PriceMatchingService } from '../server/services/PriceMatchingService.js';
import VercelBlobService from '../server/services/VercelBlobService.js';
import fs from 'fs-extra';
import path from 'path';

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
  
  if (req.method !== 'POST') {
    console.log(`❌ [PROCESS] Invalid method: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let jobId = null;
  let priceMatchingService = null;
  
  try {
    console.log(`🔄 [PROCESS] Parsing request body...`);
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

    // Create service instance with better error handling
    console.log(`🔄 [PROCESS] Creating PriceMatchingService...`);
    try {
      priceMatchingService = new PriceMatchingService();
      console.log(`✅ [PROCESS] PriceMatchingService created successfully`);
      
      // Test database connection
      console.log(`🔄 [PROCESS] Testing database connection...`);
      const { data: testData, error: testError } = await priceMatchingService.supabase
        .from('ai_matching_jobs')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error(`❌ [PROCESS] Database connection test failed:`, testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log(`✅ [PROCESS] Database connection test successful`);
      
    } catch (serviceError) {
      console.error(`❌ [PROCESS] PriceMatchingService creation failed:`, serviceError);
      console.error(`❌ [PROCESS] Service error stack:`, serviceError.stack);
      throw new Error(`Service initialization failed: ${serviceError.message}`);
    }

    // Get job details - use correct table name
    console.log(`🔄 [PROCESS] Fetching job details from database...`);
    const { data: job, error: jobError } = await priceMatchingService.supabase
      .from('ai_matching_jobs')  // Correct table name
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

    if (!job.input_file_blob_key && !job.input_file_blob_url) {
      console.error(`❌ [PROCESS] No input file for job: ${jobId}`);
      return res.status(400).json({ error: 'No input file found' });
    }

    // Prefer blob URL over blob key for downloading
    const downloadSource = job.input_file_blob_url || job.input_file_blob_key;
    console.log(`📥 [PROCESS] Downloading file from storage: ${downloadSource.substring(0, 100)}...`);

    // Update job status to show we're starting
    console.log(`🔄 [PROCESS] Updating job status to processing...`);
    const statusUpdateResult = await priceMatchingService.updateJobStatus(jobId, 'processing', 5, 'Downloading file...');
    console.log(`✅ [PROCESS] Status updated successfully:`, statusUpdateResult);

    // Download file from Vercel Blob
    console.log(`📥 [PROCESS] Starting file download...`);
    let fileData;
    try {
      fileData = await VercelBlobService.downloadFile(downloadSource);
      console.log(`✅ [PROCESS] File downloaded, size: ${fileData.Body?.length || 0} bytes`);
    } catch (downloadError) {
      console.error(`❌ [PROCESS] File download failed:`, downloadError);
      throw new Error(`File download failed: ${downloadError.message}`);
    }
    
    // Save to temp file
    const tempFilePath = path.join('/tmp', `job-${jobId}-${job.original_filename}`);
    console.log(`💾 [PROCESS] Saving file to: ${tempFilePath}`);
    try {
      await fs.writeFile(tempFilePath, fileData.Body);
      console.log(`✅ [PROCESS] File saved to: ${tempFilePath}`);
    } catch (writeError) {
      console.error(`❌ [PROCESS] File write failed:`, writeError);
      throw new Error(`File write failed: ${writeError.message}`);
    }

    // Update status before processing
    await priceMatchingService.updateJobStatus(jobId, 'processing', 10, 'Starting analysis...');

    // Process the file
    console.log(`🚀 [PROCESS] Starting price matching...`);
    let outputPath;
    try {
      outputPath = await priceMatchingService.processFile(
        jobId, 
        tempFilePath, 
        job.original_filename, 
        job.matching_method || 'cohere'  // Use the method from the job
      );
      console.log(`✅ [PROCESS] Processing completed, output path: ${outputPath}`);
    } catch (processError) {
      console.error(`❌ [PROCESS] Price matching failed:`, processError);
      console.error(`❌ [PROCESS] Process error stack:`, processError.stack);
      throw new Error(`Price matching failed: ${processError.message}`);
    }

    // Upload output to Vercel Blob if it exists
    if (outputPath && await fs.pathExists(outputPath)) {
      console.log(`📤 [PROCESS] Uploading output file...`);
      try {
        const outputBuffer = await fs.readFile(outputPath);
        const outputFileName = path.basename(outputPath);
        const outputStorageResult = await VercelBlobService.uploadFile(
          outputBuffer,
          outputFileName,
          jobId,
          'output'
        );
        
        // Update job with output storage information
        await priceMatchingService.supabase
          .from('ai_matching_jobs')  // Correct table name
          .update({ 
            output_file_blob_key: outputStorageResult.key,
            output_file_blob_url: outputStorageResult.url 
          })
          .eq('id', jobId);
        
        console.log(`✅ [PROCESS] Output uploaded: ${outputStorageResult.key}`);
      } catch (uploadError) {
        console.error(`❌ [PROCESS] Output upload failed:`, uploadError);
        // Don't fail the job for upload issues, just log it
      }
    } else {
      console.log(`⚠️ [PROCESS] No output file generated or file doesn't exist: ${outputPath}`);
    }

    const completionTime = Date.now();
    const totalTime = completionTime - startTime;
    console.log(`🎉 [PROCESS] Job ${jobId} completed successfully in ${totalTime}ms`);
    
    res.json({ 
      success: true, 
      message: 'Processing completed',
      jobId,
      processingTimeMs: totalTime
    });

  } catch (error) {
    console.error(`❌ [PROCESS] Error processing job ${jobId}:`, error);
    console.error(`❌ [PROCESS] Error stack:`, error.stack);
    console.error(`❌ [PROCESS] Error name:`, error.name);
    console.error(`❌ [PROCESS] Error constructor:`, error.constructor.name);
    
    // Update job status to failed with better error details
    try {
      if (jobId && priceMatchingService) {
        await priceMatchingService.updateJobStatus(jobId, 'failed', 0, error.message);
        console.log(`✅ [PROCESS] Job status updated to failed`);
      } else if (jobId) {
        // Try to create a new service instance just for updating the status
        console.log(`🔄 [PROCESS] Attempting to create new service instance for status update...`);
        const fallbackService = new PriceMatchingService();
        await fallbackService.updateJobStatus(jobId, 'failed', 0, error.message);
        console.log(`✅ [PROCESS] Job status updated to failed via fallback service`);
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