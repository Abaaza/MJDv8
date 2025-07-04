import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { PriceMatchingService } from '../services/PriceMatchingService.js'
import { ExcelExportService } from '../services/ExcelExportService.js'
import VercelBlobService from '../services/VercelBlobService.js'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Set to track cancelled jobs (in-memory, will reset on server restart)
const cancelledJobs = new Set()

// Cleanup function to prevent memory leaks
function cleanupOldCancelledJobs() {
  // In a production system, you might want to persist this data
  // For now, we'll just log the cleanup
  const currentSize = cancelledJobs.size
  if (currentSize > 100) { // Arbitrary threshold
    console.log(`🧹 Cancelled jobs set getting large (${currentSize} items), consider restarting server`)
  }
}

// Run cleanup every hour
setInterval(cleanupOldCancelledJobs, 60 * 60 * 1000)

// Configure multer for file uploads
const storage = multer.memoryStorage() // Use memory storage for Vercel Blob uploads

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'))
    }
  }
})

// Lazy instantiation function to ensure environment variables are loaded
function getPriceMatchingService() {
  return new PriceMatchingService()
}

// Process price matching with file upload
router.post('/process', upload.single('file'), async (req, res) => {
  try {
    console.log('🚀 Process endpoint called with:', {
      hasFile: !!req.file,
      matchingMethod: req.body.matchingMethod,
      projectName: req.body.projectName
    })

    const matchingMethod = req.body.matchingMethod || 'cohere'
    const { projectName, clientName, userId } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!projectName || !clientName || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectName, clientName, userId' 
      })
    }

    const jobId = uuidv4()
    console.log(`✅ Generated job ID: ${jobId}`)

    // Save uploaded file to temporary location
    const tempDir = path.join(__dirname, '..', 'temp')
    await fs.ensureDir(tempDir)
    const tempFilePath = path.join(tempDir, `job-${jobId}-${req.file.originalname}`)
    await fs.writeFile(tempFilePath, req.file.buffer)
    console.log(`✅ File saved to: ${tempFilePath}`)

    // Upload to Vercel Blob first
    const storageResult = await VercelBlobService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      jobId,
      'input'
    )
    console.log(`✅ File uploaded to storage: ${storageResult.key}`)

    // Create service instance
    const priceMatchingService = getPriceMatchingService()

    // Create matching job record with PROCESSING status directly to avoid race condition
    const { data: jobData, error: jobError } = await priceMatchingService.supabase
      .from('ai_matching_jobs')
      .insert({
        id: jobId,
        user_id: userId,
        project_name: projectName,
        client_name: clientName,
        original_filename: req.file.originalname,
        input_file_blob_key: storageResult.key,
        input_file_blob_url: storageResult.url,
        status: 'processing', // Start directly in processing to avoid pending->processing race condition
        progress: 1,
        error_message: 'Initializing...',
        created_at: new Date().toISOString(),
        // Initialize these fields to prevent null issues
        matched_items: 0,
        total_items: 0,
        confidence_score: 0
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      throw new Error('Failed to create job record')
    }

    console.log(`✅ Created job record with processing status: ${jobId}`)

    // Start processing in background with proper error handling - DON'T AWAIT
    setImmediate(async () => {
      try {
        // Check if job was cancelled before starting
        if (cancelledJobs.has(jobId)) {
          console.log(`🛑 Job ${jobId} was cancelled before processing started`)
          return
        }
        
        await priceMatchingService.processFile(jobId, tempFilePath, req.file.originalname, matchingMethod)
        
        // After processing, upload output to Vercel Blob if it exists
        const outputPath = await findOutputFile(jobId)
        if (outputPath) {
          const outputBuffer = await fs.readFile(outputPath)
          const outputFileName = path.basename(outputPath)
          const outputStorageResult = await VercelBlobService.uploadFile(
            outputBuffer,
            outputFileName,
            jobId,
            'output'
          )
          
          // Update job with output storage information - but only if not cancelled/stopped
          const currentJob = await priceMatchingService.getJobStatus(jobId)
          if (currentJob && !['stopped', 'cancelled', 'failed'].includes(currentJob.status)) {
            await priceMatchingService.supabase
              .from('ai_matching_jobs')
              .update({ 
                output_file_blob_key: outputStorageResult.key,
                output_file_blob_url: outputStorageResult.url 
              })
              .eq('id', jobId)
          }
        }
        
        // Only clean up from cancellation tracker if job completed successfully
        const finalJob = await priceMatchingService.getJobStatus(jobId)
        if (finalJob && finalJob.status === 'completed') {
          cancelledJobs.delete(jobId)
        }
        
      } catch (error) {
        console.error(`Background processing failed for job ${jobId}:`, error)
        
        // Only update status to failed if not already stopped/cancelled
        try {
          const currentJob = await priceMatchingService.getJobStatus(jobId)
          if (currentJob && !['stopped', 'cancelled'].includes(currentJob.status)) {
            await priceMatchingService.updateJobStatus(jobId, 'failed', 0, error.message)
          }
        } catch (updateError) {
          console.error(`Failed to update job status for ${jobId}:`, updateError)
        }
        
        // Only remove from cancellation tracker if job actually failed (not stopped)
        const finalJob = await priceMatchingService.getJobStatus(jobId)
        if (finalJob && finalJob.status === 'failed') {
          cancelledJobs.delete(jobId)
        }
      }
    })

    res.json({ 
      success: true, 
      message: `Processing started using ${matchingMethod}`,
      jobId,
      matchingMethod,
      storageKey: storageResult.key
    })

  } catch (error) {
    console.error('Process endpoint error:', error)
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    })
  }
})

// Process price matching with base64 data (compatible with existing frontend)
router.post('/process-base64', async (req, res) => {
  try {
    console.log('🚀 [VERCEL DEBUG] Starting process-base64 endpoint')
    console.log('🚀 [VERCEL DEBUG] Environment check:', {
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
    })
    
    const { jobId, fileName, fileData, matchingMethod = 'cohere' } = req.body
    
    if (!jobId || !fileName || !fileData) {
      console.error('❌ [VERCEL DEBUG] Missing required fields:', { jobId: !!jobId, fileName: !!fileName, fileData: !!fileData })
      return res.status(400).json({ 
        error: 'Missing required fields: jobId, fileName, fileData' 
      })
    }

    console.log(`✅ [VERCEL DEBUG] Starting price matching for job: ${jobId} using ${matchingMethod}`)
    console.log(`✅ [VERCEL DEBUG] File: ${fileName}`)

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64')
    console.log(`✅ [VERCEL DEBUG] Buffer created, size: ${buffer.length} bytes`)
    
    // Upload to Vercel Blob
    console.log('📦 [VERCEL DEBUG] Uploading to Vercel Blob...')
    const storageResult = await VercelBlobService.uploadFile(
      buffer,
      fileName,
      jobId,
      'input'
    )
    console.log(`✅ [VERCEL DEBUG] File uploaded to storage: ${storageResult.key}`)

    // Save to temp directory for processing - handle Windows vs Linux paths
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'temp')
    await fs.ensureDir(tempDir) // Ensure directory exists
    const tempFilePath = path.join(tempDir, `job-${jobId}-${fileName}`)
    console.log(`📁 [VERCEL DEBUG] Saving to temp path: ${tempFilePath}`)
    await fs.writeFile(tempFilePath, buffer)
    console.log(`✅ [VERCEL DEBUG] File saved to temp directory`)

    // Create service instance when needed (after dotenv is loaded)
    console.log('🔧 [VERCEL DEBUG] Creating PriceMatchingService...')
    const priceMatchingService = getPriceMatchingService()
    console.log('✅ [VERCEL DEBUG] PriceMatchingService created')

    // Update job with storage file information
    console.log('💾 [VERCEL DEBUG] Updating job with storage info...')
    const updateResult = await priceMatchingService.supabase
      .from('ai_matching_jobs')  // Fix table name
      .update({ 
        input_file_blob_key: storageResult.key,
        input_file_blob_url: storageResult.url 
      })
      .eq('id', jobId)
    
    if (updateResult.error) {
      console.error('❌ [VERCEL DEBUG] Job update failed:', updateResult.error)
    } else {
      console.log('✅ [VERCEL DEBUG] Job updated with storage info')
    }

    // HYBRID SOLUTION: Start processing then return response to avoid Vercel timeout
    console.log('🚀 [PROCESSING] Starting HYBRID processing for Vercel serverless...')
    
    // Check if job was cancelled before starting
    if (cancelledJobs.has(jobId)) {
      console.log(`🛑 [PROCESSING] Job ${jobId} was cancelled before processing started`)
      return res.status(500).json({ 
        success: false, 
        error: 'Processing failed',
        message: 'Job was cancelled by user',
        jobId
      })
    }
    
    console.log(`🔄 [PROCESSING] Starting hybrid processing for job ${jobId}`)
    console.log(`🔄 [PROCESSING] About to call processFile with:`, {
      jobId,
      tempFilePath,
      fileName,
      matchingMethod,
      fileExists: await fs.pathExists(tempFilePath)
    })
    

    
    // SYNCHRONOUS APPROACH: Use full 300s to complete processing
    console.log(`🚀 [PROCESSING] Starting SYNCHRONOUS processing for Vercel Pro (300s available)`)
    
    try {
      // Update job status to processing
      await priceMatchingService.updateJobStatus(jobId, 'processing', 0, 'Processing started...')
      console.log(`✅ [PROCESSING] Job ${jobId} status updated to processing`)
      
      // Process the file synchronously - use the full 300 seconds
      console.log(`🔥 [PROCESSING] CRITICAL: About to call processFile SYNCHRONOUSLY for job ${jobId}`)
      const result = await priceMatchingService.processFile(jobId, tempFilePath, fileName, matchingMethod)
      console.log(`✅ [PROCESSING] SYNCHRONOUS processing completed for job ${jobId}`)
      
      // Upload output to storage if it exists
      const outputPath = await findOutputFile(jobId)
      if (outputPath) {
        console.log(`📁 [PROCESSING] Uploading output file to storage...`)
        try {
          const outputBuffer = await fs.readFile(outputPath)
          const outputFileName = path.basename(outputPath)
          const outputStorageResult = await VercelBlobService.uploadFile(
            outputBuffer,
            outputFileName,
            jobId,
            'output'
          )
          
          // Update job with output storage information
          await priceMatchingService.supabase
            .from('ai_matching_jobs')
            .update({ 
              output_file_blob_key: outputStorageResult.key,
              output_file_blob_url: outputStorageResult.url 
            })
            .eq('id', jobId)
          console.log(`✅ [PROCESSING] Output uploaded to storage successfully`)
        } catch (uploadError) {
          console.error(`⚠️ [PROCESSING] Failed to upload output file:`, uploadError)
        }
      }
      
      // Return success response after processing is complete
      console.log('✅ [VERCEL DEBUG] Returning success response after SYNCHRONOUS processing')
      res.json({ 
        success: true, 
        message: `Processing completed using ${matchingMethod}`,
        jobId,
        matchingMethod,
        storageKey: storageResult.key,
        status: 'completed',
        note: 'Processing completed successfully'
      })
      
    } catch (processingError) {
      console.error(`❌ [PROCESSING] SYNCHRONOUS processing failed for job ${jobId}:`, processingError)
      console.error(`❌ [PROCESSING] Error stack:`, processingError.stack)
      
      // Update job status to failed
      try {
        await priceMatchingService.updateJobStatus(jobId, 'failed', 0, `Error: ${processingError.message}`)
      } catch (updateError) {
        console.error(`❌ [PROCESSING] Failed to update job status:`, updateError)
      }
      
      // Return error response
      res.status(500).json({ 
        success: false, 
        error: 'Processing failed',
        message: processingError.message,
        jobId
      })
    }

  } catch (error) {
    console.error('❌ [VERCEL DEBUG] Process base64 endpoint error:', error)
    console.error('❌ [VERCEL DEBUG] Error stack:', error.stack)
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    })
  }
})

// Helper function to find output file
async function findOutputFile(jobId) {
  const priceMatchingService = getPriceMatchingService()
  const jobStatus = await priceMatchingService.getJobStatus(jobId)
  
  if (jobStatus?.output_file_path) {
    const filePath = path.isAbsolute(jobStatus.output_file_path) 
      ? jobStatus.output_file_path 
      : path.join('/tmp', path.basename(jobStatus.output_file_path))
    
    if (await fs.pathExists(filePath)) {
      return filePath
    }
  }
  
  // Fallback: search in temp directory
  const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'temp')
  try {
    const files = await fs.readdir(tempDir)
    const matchingFiles = files.filter(f => f.includes(jobId))
    if (matchingFiles.length > 0) {
      return path.join(tempDir, matchingFiles[matchingFiles.length - 1])
    }
  } catch (err) {
    console.error('Error searching temp directory:', err)
  }
  
  return null
}

// Download processed results from Vercel Blob
router.get('/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    
    console.log(`[DOWNLOAD DEBUG] Request for job: ${jobId}`)
    
    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()
    
    // Get job details to find the output file
    const jobStatus = await priceMatchingService.getJobStatus(jobId)
    
    console.log(`[DOWNLOAD DEBUG] Job status:`, {
      exists: !!jobStatus,
      status: jobStatus?.status,
      output_file_path: jobStatus?.output_file_path,
      output_file_blob_key: jobStatus?.output_file_blob_key
    })
    
    if (!jobStatus) {
      console.log(`[DOWNLOAD DEBUG] Job not found`)
      return res.status(404).json({ error: 'Job not found' })
    }
    
    // First try to download from Vercel Blob if available
    if (jobStatus.output_file_blob_key) {
      console.log(`[DOWNLOAD DEBUG] Downloading from Blob: ${jobStatus.output_file_blob_key}`)
      try {
        const blobFile = await VercelBlobService.downloadFile(jobStatus.output_file_blob_key)
        const fileName = `matched-${jobId}.xlsx`
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        res.setHeader('Content-Type', blobFile.ContentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        
        return res.send(blobFile.Body)
      } catch (blobError) {
        console.error('[DOWNLOAD DEBUG] Blob download failed:', blobError)
        // Fall back to local file
      }
    }
    
    // Fall back to temp file system
    let filePath = null
    
    // First try to use output_file_path if available
    if (jobStatus.output_file_path) {
      console.log(`[DOWNLOAD DEBUG] Using output_file_path from database`)
      filePath = jobStatus.output_file_path
    
      // If it's not an absolute path, assume it's in the temp directory
      if (!path.isAbsolute(filePath)) {
        const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'temp')
        filePath = path.join(tempDir, path.basename(filePath))
      }
    } else {
      console.log(`[DOWNLOAD DEBUG] No output_file_path in database, searching temp directory`)
      
              // Fallback: Search for file in temp directory
        const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'temp')
      try {
        const files = await fs.readdir(tempDir)
        
        // Look for files matching the job ID
        const matchingFiles = files.filter(f => f.includes(jobId))
        console.log(`[DOWNLOAD DEBUG] Found ${matchingFiles.length} files matching job ID:`, matchingFiles)
        
        if (matchingFiles.length > 0) {
          // Use the most recent one (in case there are multiple)
          filePath = path.join(tempDir, matchingFiles[matchingFiles.length - 1])
          console.log(`[DOWNLOAD DEBUG] Selected file: ${filePath}`)
        }
      } catch (err) {
        console.error(`[DOWNLOAD DEBUG] Error reading temp directory:`, err)
      }
    }
    
    if (!filePath) {
      console.log(`[DOWNLOAD DEBUG] No file found for job`)
      return res.status(404).json({ error: 'No output file found for this job' })
    }
    
    console.log(`[DOWNLOAD DEBUG] Checking file at: ${filePath}`)
    
    if (!await fs.pathExists(filePath)) {
      console.log(`[DOWNLOAD DEBUG] File not found at: ${filePath}`)
      return res.status(404).json({ error: 'Output file not found on disk' })
    }

    console.log(`[DOWNLOAD DEBUG] File found, sending: ${filePath}`)
    const fileName = path.basename(filePath)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

  } catch (error) {
    console.error('[DOWNLOAD DEBUG] Download endpoint error:', error)
    res.status(500).json({ 
      error: 'Download failed',
      message: error.message 
    })
  }
})

// Get job status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    
    console.log(`📊 Status check requested for job: ${jobId}`)
    
    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()
    const status = await priceMatchingService.getJobStatus(jobId)
    
    if (!status) {
      console.log(`❌ No status found for job ${jobId}`)
      return res.status(404).json({ 
        error: 'Job not found',
        message: `No job found with ID: ${jobId}`,
        jobId
      })
    }
    
    console.log(`📊 Status found for job ${jobId}:`, {
      status: status.status,
      progress: status.progress,
      matched_items: status.matched_items,
      total_items: status.total_items,
      updated_at: status.updated_at
    })
    
    res.json(status)

  } catch (error) {
    console.error(`❌ Status endpoint error for job ${req.params.jobId}:`, error)
    res.status(500).json({ 
      error: 'Failed to get status',
      message: error.message,
      jobId: req.params.jobId
    })
  }
})

// Cancel/stop a processing job
router.post('/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    
    console.log(`🛑 Cancel requested for job: ${jobId}`)
    
    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()
    
    // Get current job status
    const currentJob = await priceMatchingService.getJobStatus(jobId)
    
    if (!currentJob) {
      console.log(`❌ Job ${jobId} not found`)
      return res.status(404).json({ error: 'Job not found' })
    }
    
    console.log(`🔍 Current job status: ${currentJob.status}`)
    
    // Allow stopping jobs that are processing or pending
    if (!['processing', 'pending'].includes(currentJob.status)) {
      console.log(`⚠️ Job ${jobId} is in ${currentJob.status} state, cannot stop`)
      return res.status(400).json({ 
        error: `Cannot stop job in ${currentJob.status} state`,
        currentStatus: currentJob.status
      })
    }
    
    // Add job to cancellation tracker FIRST to prevent race conditions
    cancelledJobs.add(jobId)
    console.log(`🛑 Added job ${jobId} to cancellation tracker. Cancelled jobs: [${Array.from(cancelledJobs).join(', ')}]`)
    
    // Update job status to stopped with protection against concurrent updates
    console.log(`🛑 Updating job ${jobId} status to 'stopped'...`)
    
    const { data: updatedJob, error: updateError } = await priceMatchingService.supabase
      .from('ai_matching_jobs')
      .update({
        status: 'stopped',
        progress: 0,
        error_message: 'Job stopped by user',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('status', currentJob.status) // Only update if status hasn't changed
      .select()
      .single()
    
    if (updateError) {
      console.error(`❌ Failed to update job ${jobId} status:`, updateError)
      // Remove from cancellation tracker if update failed
      cancelledJobs.delete(jobId)
      return res.status(500).json({ 
        error: 'Failed to stop job',
        message: updateError.message
      })
    }
    
    if (!updatedJob) {
      console.log(`⚠️ Job ${jobId} status was changed by another process, retrying...`)
      
      // Check current status again
      const retryJob = await priceMatchingService.getJobStatus(jobId)
      if (retryJob && ['processing', 'pending'].includes(retryJob.status)) {
        // Try one more time
        const { data: retryUpdatedJob, error: retryUpdateError } = await priceMatchingService.supabase
          .from('ai_matching_jobs')
          .update({
            status: 'stopped',
            progress: 0,
            error_message: 'Job stopped by user',
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId)
          .eq('status', retryJob.status)
          .select()
          .single()
          
        if (retryUpdateError || !retryUpdatedJob) {
          console.error(`❌ Retry failed to update job ${jobId} status`)
          cancelledJobs.delete(jobId)
          return res.status(500).json({ 
            error: 'Failed to stop job - status was changed by another process',
            currentStatus: retryJob?.status
          })
        }
        
        console.log(`✅ Job ${jobId} stopped successfully on retry`)
      } else {
        console.log(`ℹ️ Job ${jobId} is already in final state: ${retryJob?.status}`)
        // If it's already in a final state, consider it successful
        if (['completed', 'failed', 'stopped'].includes(retryJob?.status)) {
          return res.json({ 
            success: true, 
            message: `Job was already ${retryJob.status}`,
            jobId: jobId,
            previousStatus: currentJob.status,
            currentStatus: retryJob.status
          })
        }
      }
    } else {
      console.log(`✅ Job ${jobId} status successfully updated to 'stopped'`)
    }
    
    // Verify the update was successful
    const verificationJob = await priceMatchingService.getJobStatus(jobId)
    console.log(`🔍 Verification: Job ${jobId} current status in database: '${verificationJob?.status}'`)
    
    // Don't remove from cancellation tracker - keep it there to prevent any background processing
    // The job will be cleaned up when it's actually processed or when the server restarts
    
    res.json({ 
      success: true, 
      message: 'Job stopped successfully',
      jobId: jobId,
      previousStatus: currentJob.status,
      currentStatus: 'stopped'
    })

  } catch (error) {
    console.error(`❌ Cancel endpoint error for job ${req.params.jobId}:`, error)
    res.status(500).json({ 
      error: 'Failed to cancel job',
      message: error.message,
      jobId: req.params.jobId
    })
  }
})

// Export filtered match results - uses format-preserving version
router.post('/export/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const { matchResults } = req.body
    
    console.log(`📊 [EXPORT] Export requested for job: ${jobId}`)
    console.log(`📊 [EXPORT] Match results received:`, {
      hasMatchResults: !!matchResults,
      isArray: Array.isArray(matchResults),
      length: matchResults?.length || 0
    })
    
    if (!matchResults || !Array.isArray(matchResults)) {
      return res.status(400).json({ error: 'Match results are required and must be an array' })
    }

    // Create service instances
    const priceMatchingService = getPriceMatchingService()
    const exportService = new ExcelExportService()
    
    // EXPORT PROTECTION: Get job details but don't allow any status updates
    console.log(`🛡️ [EXPORT] Reading job status (READ-ONLY operation)`)
    const jobStatus = await priceMatchingService.getJobStatus(jobId)
    
    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    // Ensure we're only working with completed jobs for export
    if (jobStatus.status !== 'completed') {
      console.log(`⚠️ [EXPORT] Job ${jobId} is not completed (status: ${jobStatus.status}), but allowing export`)
    }
    
    // If no match results provided, try to load from database
    let resultsToExport = matchResults
    if (matchResults.length === 0) {
      console.log(`⚠️ [EXPORT] No match results provided, attempting to load from database...`)
      
      // Try to load results from database
      const { data: dbResults, error: dbError } = await priceMatchingService.supabase
        .from('match_results')
        .select('*')
        .eq('job_id', jobId)
        .order('row_number')
      
      if (!dbError && dbResults && dbResults.length > 0) {
        console.log(`✅ [EXPORT] Loaded ${dbResults.length} results from database`)
        resultsToExport = dbResults.map(result => ({
          id: result.id,
          original_description: result.original_description,
          matched_description: result.matched_description || '',
          matched_rate: result.matched_rate || 0,
          similarity_score: result.similarity_score || 0,
          row_number: result.row_number,
          sheet_name: result.sheet_name,
          quantity: result.quantity || 0,
          unit: result.unit || '',
          total_amount: (result.quantity || 0) * (result.matched_rate || 0),
          matched_price_item_id: result.matched_price_item_id,
          match_method: result.match_method || 'cohere'
        }))
      } else {
        console.log(`⚠️ [EXPORT] No results found in database either`)
      }
    }
    
    console.log(`📊 [EXPORT] Export will process ${resultsToExport.length} results`)
    
    let outputPath = null
    let originalFilePath = null
    
    // Enhanced logic to get the original file from multiple sources with detailed logging
    console.log(`🔍 [EXPORT] Looking for original file for job: ${jobId}`)
    console.log(`📋 [EXPORT] Job status info:`, {
      input_file_blob_key: jobStatus.input_file_blob_key ? 'exists' : 'missing',
      original_file_path: jobStatus.original_file_path ? 'exists' : 'missing', 
      original_filename: jobStatus.original_filename
    })
    
    // 1. Check if we have the input file in Vercel Blob
    if (jobStatus.input_file_blob_key) {
      console.log(`📥 [EXPORT] Attempting to download original file from Blob: ${jobStatus.input_file_blob_key}`)
      try {
        const originalFileData = await VercelBlobService.downloadFile(jobStatus.input_file_blob_key)
        
        // Save to temp directory
        const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'temp')
        await fs.ensureDir(tempDir)
        originalFilePath = path.join(tempDir, `export-original-${jobId}-${jobStatus.original_filename}`)
        await fs.writeFile(originalFilePath, originalFileData.Body)
        
        console.log(`✅ [EXPORT] Original file downloaded from blob and saved to: ${originalFilePath}`)
        console.log(`📊 [EXPORT] File size: ${originalFileData.Body.length} bytes`)
      } catch (blobError) {
        console.error('❌ [EXPORT] Failed to download original file from blob:', blobError)
        console.error('   [EXPORT] Blob key:', jobStatus.input_file_blob_key)
        console.error('   [EXPORT] Error message:', blobError.message)
      }
    } else {
      console.log(`⚠️ [EXPORT] No input_file_blob_key found in job status`)
    }
    
    // 2. Fallback: Check if original file exists locally  
    if (!originalFilePath && jobStatus.original_file_path) {
      console.log(`📁 [EXPORT] Checking local path: ${jobStatus.original_file_path}`)
      const localPath = jobStatus.original_file_path
      if (await fs.pathExists(localPath)) {
        originalFilePath = localPath
        console.log(`✅ [EXPORT] Found original file locally: ${originalFilePath}`)
      } else {
        console.log(`⚠️ [EXPORT] Local path doesn't exist: ${localPath}`)
      }
    }
    
    // 3. Fallback: Search temp directory for input file (enhanced search)
    if (!originalFilePath) {
      console.log(`🔍 [EXPORT] Searching temp directory for original file...`)
      const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'temp')
      try {
        const files = await fs.readdir(tempDir)
        console.log(`📁 [EXPORT] Files in temp directory: ${files.length}`)
        
        // Look for the exact job file first
        let inputFile = files.find(f => f.includes(`job-${jobId}-`) && f.includes(jobStatus.original_filename))
        
        // If not found, try broader search
        if (!inputFile) {
          inputFile = files.find(f => f.includes(`job-${jobId}-`))
        }
        
        // If still not found, try even broader search
        if (!inputFile) {
          inputFile = files.find(f => f.includes(jobId))
        }
        
        if (inputFile) {
          originalFilePath = path.join(tempDir, inputFile)
          console.log(`✅ [EXPORT] Found input file in temp directory: ${originalFilePath}`)
          
          // Verify the file exists and is readable
          const stats = await fs.stat(originalFilePath)
          console.log(`📊 [EXPORT] File size: ${stats.size} bytes, modified: ${stats.mtime}`)
        } else {
          console.log(`❌ [EXPORT] No matching files found in temp directory`)
          console.log(`   [EXPORT] Available files:`, files.slice(0, 10)) // Show first 10 files
        }
      } catch (err) {
        console.error('❌ [EXPORT] Error searching temp directory:', err)
      }
    }
    
    console.log(`🔍 [EXPORT] Final original file path: ${originalFilePath || 'NOT FOUND'}`)
    
    // Export with preserved formatting if original file is available
    if (originalFilePath && await fs.pathExists(originalFilePath)) {
      console.log(`📄 [EXPORT] Creating Excel export with preserved formatting...`)
      console.log(`   [EXPORT] Using original file: ${originalFilePath}`)
      console.log(`   [EXPORT] Processing ${resultsToExport.length} results`)
      
      try {
        outputPath = await exportService.exportWithOriginalFormat(
          originalFilePath,
          resultsToExport,
          jobId,
          jobStatus.original_filename
        )
        console.log(`✅ [EXPORT] Format-preserved Excel export completed: ${outputPath}`)
      } catch (formatError) {
        console.error('❌ [EXPORT] Error in format-preserved export, falling back to basic export:', formatError)
        outputPath = await exportService.exportToExcel(
          resultsToExport,
          jobId,
          jobStatus.original_filename || 'export'
        )
      }
    } else {
      console.log(`📄 [EXPORT] Creating basic Excel export (original file not available)...`)
      console.log(`   [EXPORT] Reason: originalFilePath = ${originalFilePath || 'null'}`)
      if (originalFilePath) {
        console.log(`   [EXPORT] File exists check: ${await fs.pathExists(originalFilePath)}`)
      }
      outputPath = await exportService.exportToExcel(
        resultsToExport,
        jobId,
        jobStatus.original_filename || 'export'
      )
    }

    if (!outputPath || !await fs.pathExists(outputPath)) {
      throw new Error('Failed to create export file')
    }

    console.log(`✅ [EXPORT] Export file created: ${outputPath}`)
    console.log(`🛡️ [EXPORT] Export completed successfully without affecting job status`)
    
    // Send the file
    const fileName = path.basename(outputPath)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
    const fileStream = fs.createReadStream(outputPath)
    fileStream.pipe(res)
    
    // Clean up the export file after sending (optional)
    fileStream.on('end', () => {
      fs.unlink(outputPath).catch(err => console.error('[EXPORT] Error cleaning up export file:', err))
    })

  } catch (error) {
    console.error('[EXPORT] Export error:', error)
    res.status(500).json({ 
      error: 'Export failed',
      message: error.message 
    })
  }
})

// Local matching endpoint for individual items - using sophisticated LocalPriceMatchingService
router.post('/match-item-local', async (req, res) => {
  try {
    const { description, threshold = 0.5 } = req.body
    
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Description is required and must be a string' 
      })
    }

    console.log(`🔍 [SOPHISTICATED] Local matching request for: "${description}"`)
    
    // Import the sophisticated LocalPriceMatchingService
    const { LocalPriceMatchingService } = await import('../services/LocalPriceMatchingService.js')
    const localMatcher = new LocalPriceMatchingService()
    
    // Get service instance for database access
    const priceMatchingService = getPriceMatchingService()
    
    // Load all price items for local matching
    const { data: priceItems, error: priceError } = await priceMatchingService.supabase
      .from('price_items')
      .select('id, description, rate, unit')
      .order('description')
    
    if (priceError) {
      console.error('Error loading price items:', priceError)
      return res.status(500).json({
        success: false,
        error: 'Failed to load price items for matching'
      })
    }
    
    if (!priceItems || priceItems.length === 0) {
      return res.json({
        success: false,
        error: 'No price items available for matching'
      })
    }
    
    console.log(`📊 [SOPHISTICATED] Loaded ${priceItems.length} price items for sophisticated local matching`)
    
    // Use the sophisticated LocalPriceMatchingService to find the best match
    // Create a mock item for the sophisticated matcher
    const mockItem = {
      description: description,
      row_number: 1,
      sheet_name: 'Individual Match',
      quantity: 1
    }
    
    // Preprocess the description using the sophisticated service
    const processedItem = localMatcher.preprocessDescription(description)
    const itemTokens = localMatcher.tokenizeDescription(description)
    const itemKeywords = localMatcher.extractKeywords(description)
    
    // Preprocess price list using the sophisticated service
    const processedPriceList = priceItems.map(item => ({
      ...item,
      processed_description: localMatcher.preprocessDescription(item.description),
      tokens: localMatcher.tokenizeDescription(item.description),
      keywords: localMatcher.extractKeywords(item.description)
    }))
    
    console.log(`🧠 [SOPHISTICATED] Using advanced NLP algorithms...`)
    
    // Use the sophisticated findBestMatch method
    const match = localMatcher.findBestMatch(processedItem, processedPriceList, itemTokens, itemKeywords)
    
    if (match && match.item) {
      const matchResult = {
        matched_description: match.item.description,
        matched_rate: match.item.rate,
        unit: match.item.unit,
        matched_price_item_id: match.item.id,
        similarity_score: Math.round(match.confidence * 100) // Convert to percentage
      }
      
      console.log(`✅ [SOPHISTICATED] Match found with ${matchResult.similarity_score}% confidence using method: ${match.method}`)
      console.log(`🎯 [SOPHISTICATED] Match: "${matchResult.matched_description.substring(0, 50)}..."`)
      
      res.json({
        success: true,
        match: matchResult
      })
    } else {
      // This should never happen with the sophisticated service, but just in case
      console.log(`❌ [SOPHISTICATED] Critical error: No match returned from sophisticated service`)
      res.json({
        success: false,
        error: 'Sophisticated matching service failed to return a match'
      })
    }
    
  } catch (error) {
    console.error('Sophisticated local matching error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Test endpoint to check admin settings access
router.get('/test-admin-settings', async (req, res) => {
  try {
    console.log('Testing admin settings access...')
    
    const priceMatchingService = getPriceMatchingService()
    
    // Test Supabase connection
    const { data: testData, error: testError } = await priceMatchingService.supabase
      .from('app_settings')
      .select('cohere_api_key')
      .limit(1)
      .single()
    
    if (testError) {
      console.error('Admin settings error:', testError)
      return res.json({
        success: false,
        error: testError.message,
        details: testError
      })
    }
    
    const hasApiKey = !!testData?.cohere_api_key
    const apiKeyLength = testData?.cohere_api_key?.length || 0
    
    console.log('Admin settings test result:', {
      hasApiKey,
      apiKeyLength
    })
    
    res.json({
      success: true,
      hasApiKey,
      apiKeyLength,
      message: hasApiKey ? 'Cohere API key found in admin settings' : 'No Cohere API key in admin settings'
    })
    
  } catch (error) {
    console.error('Test admin settings error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
})

// Export cancellation checker for other services
export function isJobCancelled(jobId) {
  return cancelledJobs.has(jobId)
}

// Enhanced cancellation checker that also checks database status
export async function isJobCancelledOrStopped(jobId) {
  // First check in-memory cancellation tracker
  if (cancelledJobs.has(jobId)) {
    return true
  }
  
  // Then check database status
  try {
    const priceMatchingService = getPriceMatchingService()
    const jobStatus = await priceMatchingService.getJobStatus(jobId)
    if (jobStatus && ['stopped', 'cancelled', 'failed'].includes(jobStatus.status)) {
      // Add to cancellation tracker if we find it's stopped in database
      cancelledJobs.add(jobId)
      return true
    }
  } catch (error) {
    console.error('Error checking job status for cancellation:', error)
  }
  
  return false
}

// Clean up old cancelled jobs (optional - for memory management)
export function cleanupCancelledJob(jobId) {
  cancelledJobs.delete(jobId)
}

export { router as priceMatchingRouter } 