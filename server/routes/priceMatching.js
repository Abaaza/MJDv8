import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { PriceMatchingService } from '../services/PriceMatchingService.js'
import { ExcelExportService } from '../services/ExcelExportService.js'
import VercelBlobService from '../services/VercelBlobService.js'

// Use Vercel Blob for all storage
const StorageService = VercelBlobService

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage() // Use memory storage for S3 uploads

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

    // Upload file to storage
    const storageResult = await StorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      jobId,
      'input'
    )

    console.log(`File uploaded to storage: ${storageResult.key}`)

    // Save to temp directory for processing
    const tempDir = path.join(__dirname, '..', 'temp')
    await fs.ensureDir(tempDir)
    const tempFilePath = path.join(tempDir, `job-${jobId}-${req.file.originalname}`)
    await fs.writeFile(tempFilePath, req.file.buffer)

    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()

    // Update job with S3 file information
    await priceMatchingService.supabase
      .from('matching_jobs')
      .update({ 
        input_file_s3_key: s3Result.key,
        input_file_s3_url: s3Result.url 
      })
      .eq('id', jobId)

    // Start processing in background with proper error handling
    priceMatchingService.processFile(jobId, tempFilePath, req.file.originalname, matchingMethod)
      .then(async () => {
        // After processing, upload output to S3 if it exists
        const outputPath = await findOutputFile(jobId)
        if (outputPath) {
          const outputBuffer = await fs.readFile(outputPath)
          const outputFileName = path.basename(outputPath)
          const outputS3Result = await S3Service.uploadFile(
            outputBuffer,
            outputFileName,
            jobId,
            'output'
          )
          
          // Update job with output S3 information
          await priceMatchingService.supabase
            .from('matching_jobs')
            .update({ 
              output_file_s3_key: outputS3Result.key,
              output_file_s3_url: outputS3Result.url 
            })
            .eq('id', jobId)
        }
      })
      .catch(async (error) => {
        console.error(`Background processing failed for job ${jobId}:`, error)
        // Update job status to failed
        try {
          await priceMatchingService.updateJobStatus(jobId, 'failed', 0, error.message)
        } catch (updateError) {
          console.error(`Failed to update job status for ${jobId}:`, updateError)
        }
      })

    res.json({ 
      success: true, 
      message: `Processing started using ${matchingMethod}`,
      jobId,
      matchingMethod,
      s3Key: s3Result.key
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
    const { jobId, fileName, fileData, matchingMethod = 'cohere' } = req.body
    
    if (!jobId || !fileName || !fileData) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobId, fileName, fileData' 
      })
    }

    console.log(`Starting price matching for job: ${jobId} using ${matchingMethod}`)
    console.log(`File: ${fileName}`)

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64')
    
    // Upload to Vercel Blob
    const storageResult = await StorageService.uploadFile(
      buffer,
      fileName,
      jobId,
      'input'
    )

    console.log(`File uploaded to storage: ${storageResult.key}`)

    // Save to temp directory for processing
    const tempDir = path.join(__dirname, '..', 'temp')
    await fs.ensureDir(tempDir)
    const tempFilePath = path.join(tempDir, `job-${jobId}-${fileName}`)
    await fs.writeFile(tempFilePath, buffer)

    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()

    // Update job with S3 file information
    await priceMatchingService.supabase
      .from('matching_jobs')
      .update({ 
        input_file_s3_key: s3Result.key,
        input_file_s3_url: s3Result.url 
      })
      .eq('id', jobId)

    // Start processing in background with proper error handling
    priceMatchingService.processFile(jobId, tempFilePath, fileName, matchingMethod)
      .then(async () => {
        // After processing, upload output to S3 if it exists
        const outputPath = await findOutputFile(jobId)
        if (outputPath) {
          const outputBuffer = await fs.readFile(outputPath)
          const outputFileName = path.basename(outputPath)
          const outputS3Result = await S3Service.uploadFile(
            outputBuffer,
            outputFileName,
            jobId,
            'output'
          )
          
          // Update job with output S3 information
          await priceMatchingService.supabase
            .from('matching_jobs')
            .update({ 
              output_file_s3_key: outputS3Result.key,
              output_file_s3_url: outputS3Result.url 
            })
            .eq('id', jobId)
        }
      })
      .catch(async (error) => {
        console.error(`Background processing failed for job ${jobId}:`, error)
        // Update job status to failed
        try {
          await priceMatchingService.updateJobStatus(jobId, 'failed', 0, error.message)
        } catch (updateError) {
          console.error(`Failed to update job status for ${jobId}:`, updateError)
        }
      })

    res.json({ 
      success: true, 
      message: `Processing started using ${matchingMethod}`,
      jobId,
      matchingMethod,
      s3Key: s3Result.key
    })

  } catch (error) {
    console.error('Process base64 endpoint error:', error)
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
      : path.join(__dirname, '..', jobStatus.output_file_path)
    
    if (await fs.pathExists(filePath)) {
      return filePath
    }
  }
  
  // Fallback: search in output directory
  const outputDir = path.join(__dirname, '..', 'output')
  try {
    const files = await fs.readdir(outputDir)
    const matchingFiles = files.filter(f => f.includes(jobId))
    if (matchingFiles.length > 0) {
      return path.join(outputDir, matchingFiles[matchingFiles.length - 1])
    }
  } catch (err) {
    console.error('Error searching output directory:', err)
  }
  
  return null
}

// Download processed results - always use format-preserving version
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
    
    // First try to download from S3 if available
    if (jobStatus.output_file_s3_key) {
      console.log(`[DOWNLOAD DEBUG] Downloading from S3: ${jobStatus.output_file_s3_key}`)
      try {
        const s3File = await S3Service.downloadFile(jobStatus.output_file_s3_key)
        const fileName = s3File.Metadata?.originalName || `matched-${jobId}.xlsx`
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        res.setHeader('Content-Type', s3File.ContentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        
        return res.send(s3File.Body)
      } catch (s3Error) {
        console.error('[DOWNLOAD DEBUG] S3 download failed:', s3Error)
        // Fall back to local file
      }
    }
    
    // Fall back to local file system
    let filePath = null
    
    // First try to use output_file_path if available
    if (jobStatus.output_file_path) {
      console.log(`[DOWNLOAD DEBUG] Using output_file_path from database`)
      filePath = jobStatus.output_file_path
    
      // If it's not an absolute path, assume it's in the output directory
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(__dirname, '..', filePath)
      }
    } else {
      console.log(`[DOWNLOAD DEBUG] No output_file_path in database, searching output directory`)
      
      // Fallback: Search for file in output directory
      const outputDir = path.join(__dirname, '..', 'output')
      try {
        const files = await fs.readdir(outputDir)
        
        // Look for files matching the job ID
        const matchingFiles = files.filter(f => f.includes(jobId))
        console.log(`[DOWNLOAD DEBUG] Found ${matchingFiles.length} files matching job ID:`, matchingFiles)
        
        if (matchingFiles.length > 0) {
          // Use the most recent one (in case there are multiple)
          filePath = path.join(outputDir, matchingFiles[matchingFiles.length - 1])
          console.log(`[DOWNLOAD DEBUG] Selected file: ${filePath}`)
        }
      } catch (err) {
        console.error(`[DOWNLOAD DEBUG] Error reading output directory:`, err)
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

// Export filtered match results - uses format-preserving version
router.post('/export/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const { matchResults } = req.body
    
    console.log(`📊 Export requested for job: ${jobId}`)
    console.log(`📊 Match results received:`, {
      hasMatchResults: !!matchResults,
      isArray: Array.isArray(matchResults),
      length: matchResults?.length || 0
    })
    
    if (!matchResults || !Array.isArray(matchResults)) {
      return res.status(400).json({ error: 'Match results are required and must be an array' })
    }

    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()
    const exportService = new ExcelExportService()
    
    // Get job details to find original file
    const jobStatus = await priceMatchingService.getJobStatus(jobId)
    
    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    // If no match results provided, try to load from database
    let resultsToExport = matchResults
    if (matchResults.length === 0) {
      console.log(`⚠️ No match results provided, attempting to load from database...`)
      
      // Try to load results from database
      const { data: dbResults, error: dbError } = await priceMatchingService.supabase
        .from('match_results')
        .select('*')
        .eq('job_id', jobId)
        .order('row_number')
      
      if (!dbError && dbResults && dbResults.length > 0) {
        console.log(`✅ Loaded ${dbResults.length} results from database`)
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
        console.log(`⚠️ No results found in database either`)
      }
    }
    
    console.log(`📊 Export will process ${resultsToExport.length} results`)
    
    let outputPath = null
    let originalFilePath = null
    
    // First, check if we have the original file path stored in the job record
    if (jobStatus.original_file_path) {
      originalFilePath = jobStatus.original_file_path
      console.log(`Found original file path in job record: ${originalFilePath}`)
      
      // Verify the file still exists
      if (!await fs.pathExists(originalFilePath)) {
        console.log(`⚠️ Original file no longer exists at: ${originalFilePath}`)
        originalFilePath = null
      }
    }
    
    // If not found in job record, look for the original input file in temp directory
    if (!originalFilePath) {
      const tempDir = path.join(__dirname, '..', 'temp')
      const tempFiles = await fs.readdir(tempDir).catch(() => [])
      
      // First, try to find file with job ID in the name
      let originalFile = tempFiles.find(f => f.includes(`job-${jobId}-`))
      
      if (!originalFile) {
        // Fallback: try to find by original filename
        originalFile = tempFiles.find(f => f.includes(jobStatus.original_filename))
      }
      
      if (originalFile) {
        originalFilePath = path.join(tempDir, originalFile)
        console.log(`Found original input file in temp directory: ${originalFilePath}`)
      } else {
        console.log(`⚠️ Original file not found for job ${jobId}`)
        console.log(`Available temp files: ${tempFiles.join(', ')}`)
      }
    }
    
    // If we have results to export, proceed with export
    if (resultsToExport.length > 0 || (originalFilePath && await fs.pathExists(originalFilePath))) {
      if (originalFilePath && await fs.pathExists(originalFilePath)) {
        // Always use format-preserving export
        console.log(`✅ Using format-preserving export with original file: ${originalFilePath}`)
        try {
          outputPath = await exportService.exportWithOriginalFormat(
            originalFilePath,
            resultsToExport,
            jobId,
            jobStatus.original_filename
          )
        } catch (exportError) {
          console.error(`❌ Format-preserving export failed:`, exportError)
          console.log(`⚠️ Falling back to simple export format`)
          outputPath = await exportService.exportFilteredResults(jobId, resultsToExport, jobStatus.original_filename)
        }
      } else {
        // Last resort: create a simple formatted export
        console.log('⚠️ Original file not found, using filtered export format')
        console.log('This will not preserve the original Excel formatting!')
        console.log('To preserve formatting, ensure the original input file is available')
        outputPath = await exportService.exportFilteredResults(jobId, resultsToExport, jobStatus.original_filename)
      }
    } else {
      // If no results and no original file, try to use the already processed output file
      console.log(`⚠️ No results to export and no original file found`)
      
      // Check if there's already an output file from the processing
      if (jobStatus.output_file_path) {
        outputPath = jobStatus.output_file_path
        if (!path.isAbsolute(outputPath)) {
          outputPath = path.join(__dirname, '..', outputPath)
        }
        console.log(`📄 Using existing output file: ${outputPath}`)
      } else {
        // Search for output file in output directory
        const outputDir = path.join(__dirname, '..', 'output')
        const files = await fs.readdir(outputDir).catch(() => [])
        const matchingFiles = files.filter(f => f.includes(jobId))
        
        if (matchingFiles.length > 0) {
          outputPath = path.join(outputDir, matchingFiles[matchingFiles.length - 1])
          console.log(`📄 Found existing output file: ${outputPath}`)
        }
      }
    }
    
    if (!outputPath || !await fs.pathExists(outputPath)) {
      console.error(`Export file not found at: ${outputPath}`)
      return res.status(404).json({ 
        error: 'No results available for export. The file may have been processed but results were not saved to the database.',
        suggestion: 'Try downloading the original processed file instead.'
      })
    }

    const fileName = path.basename(outputPath)
    console.log(`📤 Sending export file: ${fileName}`)
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
    const fileStream = fs.createReadStream(outputPath)
    fileStream.pipe(res)
    
    // Clean up the export file after sending (but not the original)
    fileStream.on('end', async () => {
      try {
        // Only clean up if it's a newly generated file (contains 'matched-' or 'filtered-')
        if (fileName.includes('matched-') || fileName.includes('filtered-')) {
          await fs.remove(outputPath)
          console.log(`🧹 Cleaned up export file: ${outputPath}`)
        }
      } catch (err) {
        console.error('Error cleaning up export file:', err)
      }
    })

  } catch (error) {
    console.error('Export endpoint error:', error)
    res.status(500).json({ 
      error: 'Export failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Match single item using local matcher
router.post('/match-item-local', async (req, res) => {
  try {
    const { itemDescription, quantity = 1 } = req.body
    
    if (!itemDescription) {
      return res.status(400).json({ error: 'Item description is required' })
    }

    console.log(`🔍 Local matching requested for: "${itemDescription}"`)
    
    // Create service instance
    const priceMatchingService = getPriceMatchingService()
    
    // Load price list
    const priceList = await priceMatchingService.loadPriceList()
    
    // Use local matcher to find match
    const localMatcher = priceMatchingService.localMatcher
    const match = await localMatcher.findBestMatch(
      localMatcher.preprocessDescription(itemDescription),
      priceList.map(item => ({
        ...item,
        processed_description: localMatcher.preprocessDescription(item.description || item.full_context),
        tokens: localMatcher.tokenizeDescription(item.description || item.full_context),
        keywords: localMatcher.extractKeywords(item.description || item.full_context)
      })),
      localMatcher.tokenizeDescription(itemDescription),
      localMatcher.extractKeywords(itemDescription)
    )
    
    if (match && match.confidence >= 0.01) {
      res.json({
        success: true,
        match: {
          matched_description: match.item.description || match.item.full_context,
          matched_rate: match.item.rate,
          unit: match.item.unit || '',
          similarity_score: Math.round(match.confidence * 100), // Convert to percentage
          matched_price_item_id: match.item.id,
          match_method: 'local',
          total_amount: quantity * match.item.rate
        }
      })
    } else {
      // This should rarely happen now, but keep as fallback
      res.json({
        success: false,
        message: 'No suitable match found'
      })
    }

  } catch (error) {
    console.error('Local match endpoint error:', error)
    res.status(500).json({ 
      error: 'Local matching failed',
      message: error.message 
    })
  }
})

// Test Cohere matching for a single item
router.post('/test-cohere-match', async (req, res) => {
  try {
    const { itemDescription } = req.body
    
    if (!itemDescription) {
      return res.status(400).json({ error: 'Item description is required' })
    }

    console.log(`🧪 Testing Cohere matching for: "${itemDescription}"`)
    
    // Create service instance
    const priceMatchingService = getPriceMatchingService()
    
    // Initialize Cohere
    await priceMatchingService.cohereMatcher.initializeCohere()
    
    // Load price list (just first 20 items for testing)
    const fullPriceList = await priceMatchingService.loadPriceList()
    const priceList = fullPriceList.slice(0, 20)
    
    console.log(`Testing with ${priceList.length} price items`)
    
    // Create test item
    const testItem = {
      id: 'test-1',
      description: itemDescription,
      quantity: 1,
      row_number: 1,
      sheet_name: 'Test'
    }
    
    // Try to find match
    const match = await priceMatchingService.cohereMatcher.findBestMatch(testItem, priceList)
    
    console.log('Cohere match result:', match)
    
    if (match) {
      res.json({
        success: true,
        match: {
          matched_description: match.item.description || match.item.full_context,
          matched_rate: match.item.rate,
          confidence: match.confidence,
          reasoning: match.reasoning
        },
        debug: {
          priceListSample: priceList.slice(0, 5).map(p => p.description || p.full_context)
        }
      })
    } else {
      res.json({
        success: false,
        message: 'No match found',
        debug: {
          priceListSample: priceList.slice(0, 5).map(p => p.description || p.full_context)
        }
      })
    }

  } catch (error) {
    console.error('Test Cohere endpoint error:', error)
    res.status(500).json({ 
      error: 'Cohere test failed',
      message: error.message,
      stack: error.stack
    })
  }
})

// Add a test route for debugging progress updates
router.post('/test-progress/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const priceMatchingService = new PriceMatchingService()
    
    console.log(`🧪 [TEST] Testing progress updates for job: ${jobId}`)
    
    // Test updating job status
    const updateResult = await priceMatchingService.updateJobStatus(
      jobId, 
      'processing', 
      50, 
      'Test progress update from debug endpoint', 
      {
        total_items: 100,
        matched_items: 25
      }
    )
    
    console.log(`🧪 [TEST] Update result: ${updateResult}`)
    
    // Fetch the job to verify update worked
    const { data: job, error } = await priceMatchingService.supabase
      .from('ai_matching_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (error) {
      console.error(`🧪 [TEST] Error fetching job: ${error}`)
      return res.status(500).json({ error: 'Failed to fetch job', details: error })
    }
    
    console.log(`🧪 [TEST] Current job state:`, {
      status: job.status,
      progress: job.progress,
      total_items: job.total_items,
      matched_items: job.matched_items,
      message: job.message
    })
    
    res.json({
      success: true,
      updateResult,
      currentJobState: {
        status: job.status,
        progress: job.progress,
        total_items: job.total_items,
        matched_items: job.matched_items,
        message: job.message,
        updated_at: job.updated_at
      }
    })
    
  } catch (error) {
    console.error('🧪 [TEST] Test progress endpoint error:', error)
    res.status(500).json({ error: 'Test failed', details: error.message })
  }
})

export { router as priceMatchingRouter } 