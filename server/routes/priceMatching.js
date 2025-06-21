import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { PriceMatchingService } from '../services/PriceMatchingService.js'
import { ExcelExportService } from '../services/ExcelExportService.js'
import VercelBlobService from '../services/VercelBlobService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

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
    const { jobId, matchingMethod = 'cohere' } = req.body
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' })
    }

    console.log(`Starting price matching for job: ${jobId} using ${matchingMethod}`)
    console.log(`File: ${req.file.originalname}`)

    // Upload file to Vercel Blob
    const storageResult = await VercelBlobService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      jobId,
      'input'
    )

    console.log(`File uploaded to storage: ${storageResult.key}`)

    // Save to temp directory for processing - handle Windows vs Linux paths
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'temp')
    await fs.ensureDir(tempDir) // Ensure directory exists
    const tempFilePath = path.join(tempDir, `job-${jobId}-${req.file.originalname}`)
    await fs.writeFile(tempFilePath, req.file.buffer)

    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()

    // Update job with storage file information
    await priceMatchingService.supabase
      .from('matching_jobs')
      .update({ 
        input_file_s3_key: storageResult.key,
        input_file_s3_url: storageResult.url 
      })
      .eq('id', jobId)

    // Start processing in background with proper error handling - DON'T AWAIT
    setImmediate(async () => {
      try {
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
          
          // Update job with output storage information
          await priceMatchingService.supabase
            .from('matching_jobs')
            .update({ 
              output_file_s3_key: outputStorageResult.key,
              output_file_s3_url: outputStorageResult.url 
            })
            .eq('id', jobId)
        }
      } catch (error) {
        console.error(`Background processing failed for job ${jobId}:`, error)
        // Update job status to failed
        try {
          await priceMatchingService.updateJobStatus(jobId, 'failed', 0, error.message)
        } catch (updateError) {
          console.error(`Failed to update job status for ${jobId}:`, updateError)
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
      .from('matching_jobs')
      .update({ 
        input_file_s3_key: storageResult.key,
        input_file_s3_url: storageResult.url 
      })
      .eq('id', jobId)
    
    if (updateResult.error) {
      console.error('❌ [VERCEL DEBUG] Job update failed:', updateResult.error)
    } else {
      console.log('✅ [VERCEL DEBUG] Job updated with storage info')
    }

    // In Vercel, trigger separate processing function
    if (process.env.VERCEL) {
      console.log('🚀 [VERCEL DEBUG] Triggering separate processing function...')
      
      // Call the separate processing function
      try {
        const processingUrl = `${req.protocol}://${req.get('host')}/api/process`
        console.log(`📞 [VERCEL DEBUG] Calling processing function: ${processingUrl}`)
        
        fetch(processingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId })
        }).catch(error => {
          console.error(`❌ [VERCEL DEBUG] Processing function call failed:`, error)
        })
        
        console.log('✅ [VERCEL DEBUG] Processing function triggered')
      } catch (error) {
        console.error(`❌ [VERCEL DEBUG] Failed to trigger processing function:`, error)
      }
    } else {
      // Local development - use direct processing
      console.log('🚀 [LOCAL DEBUG] Starting local processing...')
      setImmediate(async () => {
        try {
          console.log(`🔄 [LOCAL DEBUG] Background processing started for job ${jobId}`)
          await priceMatchingService.processFile(jobId, tempFilePath, fileName, matchingMethod)
          console.log(`✅ [LOCAL DEBUG] Background processing completed for job ${jobId}`)
          
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
            
            // Update job with output storage information
            await priceMatchingService.supabase
              .from('matching_jobs')
              .update({ 
                output_file_s3_key: outputStorageResult.key,
                output_file_s3_url: outputStorageResult.url 
              })
              .eq('id', jobId)
            console.log(`✅ [LOCAL DEBUG] Output uploaded to storage for job ${jobId}`)
          }
        } catch (error) {
          console.error(`❌ [LOCAL DEBUG] Background processing failed for job ${jobId}:`, error)
          console.error(`❌ [LOCAL DEBUG] Error stack:`, error.stack)
          // Update job status to failed
          try {
            await priceMatchingService.updateJobStatus(jobId, 'failed', 0, error.message)
          } catch (updateError) {
            console.error(`❌ [LOCAL DEBUG] Failed to update job status for ${jobId}:`, updateError)
          }
        }
      })
    }

    console.log('✅ [VERCEL DEBUG] Returning success response')
    res.json({ 
      success: true, 
      message: `Processing started using ${matchingMethod}`,
      jobId,
      matchingMethod,
      storageKey: storageResult.key
    })

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
      output_file_s3_key: jobStatus?.output_file_s3_key
    })
    
    if (!jobStatus) {
      console.log(`[DOWNLOAD DEBUG] Job not found`)
      return res.status(404).json({ error: 'Job not found' })
    }
    
    // First try to download from Vercel Blob if available
    if (jobStatus.output_file_s3_key) {
      console.log(`[DOWNLOAD DEBUG] Downloading from Blob: ${jobStatus.output_file_s3_key}`)
      try {
        const blobFile = await VercelBlobService.downloadFile(jobStatus.output_file_s3_key)
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
    
    console.log(`📊 Status found for job ${jobId}:`, {
      status: status.status,
      progress: status.progress,
      matched_items: status.matched_items
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

export { router as priceMatchingRouter } 