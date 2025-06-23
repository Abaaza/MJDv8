// Separate Vercel function for processing jobs
// This runs independently and can take longer

import { PriceMatchingService } from '../server/services/PriceMatchingService.js';
import VercelBlobService from '../server/services/VercelBlobService.js';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req, res) {
  console.log(`🔄 [PROCESS] Function invoked with method: ${req.method}`);
  
  if (req.method !== 'POST') {
    console.log(`❌ [PROCESS] Invalid method: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let jobId = null;
  
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
      nodeEnv: process.env.NODE_ENV
    });

    // Create service instance
    console.log(`🔄 [PROCESS] Creating PriceMatchingService...`);
    const priceMatchingService = new PriceMatchingService();
    console.log(`✅ [PROCESS] PriceMatchingService created successfully`);

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
    await priceMatchingService.updateJobStatus(jobId, 'processing', 5, 'Downloading file...');
    console.log(`✅ [PROCESS] Status updated successfully`);

    // Download file from Vercel Blob
    console.log(`📥 [PROCESS] Starting file download...`);
    const fileData = await VercelBlobService.downloadFile(downloadSource);
    console.log(`✅ [PROCESS] File downloaded, size: ${fileData.Body?.length || 0} bytes`);
    
    // Save to temp file
    const tempFilePath = path.join('/tmp', `job-${jobId}-${job.original_filename}`);
    console.log(`💾 [PROCESS] Saving file to: ${tempFilePath}`);
    await fs.writeFile(tempFilePath, fileData.Body);
    
    console.log(`✅ [PROCESS] File saved to: ${tempFilePath}`);

    // Update status before processing
    await priceMatchingService.updateJobStatus(jobId, 'processing', 10, 'Starting analysis...');

    // Process the file
    console.log(`🚀 [PROCESS] Starting price matching...`);
    const outputPath = await priceMatchingService.processFile(
      jobId, 
      tempFilePath, 
      job.original_filename, 
      job.matching_method || 'cohere'  // Use the method from the job
    );
    console.log(`✅ [PROCESS] Processing completed, output path: ${outputPath}`);

    // Upload output to Vercel Blob if it exists
    if (outputPath && await fs.pathExists(outputPath)) {
      console.log(`📤 [PROCESS] Uploading output file...`);
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
    } else {
      console.log(`⚠️ [PROCESS] No output file generated or file doesn't exist: ${outputPath}`);
    }

    console.log(`🎉 [PROCESS] Job ${jobId} completed successfully`);
    
    res.json({ 
      success: true, 
      message: 'Processing completed',
      jobId 
    });

  } catch (error) {
    console.error(`❌ [PROCESS] Error processing job ${jobId}:`, error);
    console.error(`❌ [PROCESS] Error stack:`, error.stack);
    
    // Update job status to failed
    try {
      if (jobId) {
        const priceMatchingService = new PriceMatchingService();
        await priceMatchingService.updateJobStatus(jobId, 'failed', 0, error.message);
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