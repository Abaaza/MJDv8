// Separate Vercel function for processing jobs
// This runs independently and can take longer

import { PriceMatchingService } from '../server/services/PriceMatchingService.js';
import VercelBlobService from '../server/services/VercelBlobService.js';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobId } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    console.log(`🔄 [PROCESS] Starting processing for job: ${jobId}`);

    // Create service instance
    const priceMatchingService = new PriceMatchingService();

    // Get job details - use correct table name
    const { data: job, error: jobError } = await priceMatchingService.supabase
      .from('ai_matching_jobs')  // Correct table name
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error(`❌ [PROCESS] Job not found: ${jobId}`);
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.input_file_blob_key) {
      console.error(`❌ [PROCESS] No input file for job: ${jobId}`);
      return res.status(400).json({ error: 'No input file found' });
    }

    console.log(`📥 [PROCESS] Downloading file from storage: ${job.input_file_blob_key}`);

    // Update job status to show we're starting
    await priceMatchingService.updateJobStatus(jobId, 'processing', 5, 'Downloading file...');

    // Download file from Vercel Blob
    const fileData = await VercelBlobService.downloadFile(job.input_file_blob_key);
    
    // Save to temp file
    const tempFilePath = path.join('/tmp', `job-${jobId}-${job.original_filename}`);
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
    }

    console.log(`🎉 [PROCESS] Job ${jobId} completed successfully`);
    
    res.json({ 
      success: true, 
      message: 'Processing completed',
      jobId 
    });

  } catch (error) {
    console.error(`❌ [PROCESS] Error:`, error);
    
    // Update job status to failed
    try {
      const priceMatchingService = new PriceMatchingService();
      await priceMatchingService.updateJobStatus(req.body.jobId, 'failed', 0, error.message);
    } catch (updateError) {
      console.error(`❌ [PROCESS] Failed to update job status:`, updateError);
    }
    
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    });
  }
} 