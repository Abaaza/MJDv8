import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { PriceMatchingService } from '../services/PriceMatchingService.js'
import { ExcelExportService } from '../services/ExcelExportService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'temp')
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `upload-${uniqueSuffix}-${file.originalname}`)
  }
})

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
    console.log(`File: ${req.file.filename}`)

    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()

    // Start processing in background with proper error handling
    priceMatchingService.processFile(jobId, req.file.path, req.file.originalname, matchingMethod)
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
      matchingMethod
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

    // Convert base64 to file
    const tempDir = path.join(__dirname, '..', 'temp')
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const tempFilePath = path.join(tempDir, `upload-${uniqueSuffix}-${fileName}`)
    
    const buffer = Buffer.from(fileData, 'base64')
    await fs.writeFile(tempFilePath, buffer)

    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()

    // Start processing in background with proper error handling
    priceMatchingService.processFile(jobId, tempFilePath, fileName, matchingMethod)
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
      matchingMethod
    })

  } catch (error) {
    console.error('Process base64 endpoint error:', error)
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    })
  }
})

// Download processed results - always use format-preserving version
router.get('/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    
    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()
    
    // Get job details to find the output file
    const jobStatus = await priceMatchingService.getJobStatus(jobId)
    
    if (!jobStatus || !jobStatus.output_file_path) {
      return res.status(404).json({ error: 'Processed file not found' })
    }
    
    const filePath = jobStatus.output_file_path
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Output file not found on disk' })
    }

    const fileName = path.basename(filePath)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

  } catch (error) {
    console.error('Download endpoint error:', error)
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
    
    if (!matchResults || !Array.isArray(matchResults)) {
      return res.status(400).json({ error: 'Match results are required' })
    }

    console.log(`📊 Export requested for job: ${jobId} with ${matchResults.length} results`)
    
    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()
    
    // Get job details to find original file
    const jobStatus = await priceMatchingService.getJobStatus(jobId)
    
    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    // Get original file path from temp directory
    const tempDir = path.join(__dirname, '..', 'temp')
    const tempFiles = await fs.readdir(tempDir)
    const originalFile = tempFiles.find(f => f.includes(jobStatus.original_filename))
    
    if (!originalFile) {
      // Fallback to simple export if original not found
      const filePath = await priceMatchingService.exportFilteredResults(jobId, matchResults)
      
      if (!filePath || !await fs.pathExists(filePath)) {
        return res.status(404).json({ error: 'Export file could not be created' })
      }

      const fileName = path.basename(filePath)
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    } else {
      // Use format-preserving export
      const originalFilePath = path.join(tempDir, originalFile)
      const exportService = new ExcelExportService()
      const outputPath = await exportService.exportWithOriginalFormat(
        originalFilePath,
        matchResults,
        jobId,
        jobStatus.original_filename
      )
      
      const fileName = path.basename(outputPath)
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      
      const fileStream = fs.createReadStream(outputPath)
      fileStream.pipe(res)
    }

  } catch (error) {
    console.error('Export endpoint error:', error)
    res.status(500).json({ 
      error: 'Export failed',
      message: error.message 
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
    
    if (match && match.confidence >= 0.25) {
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

export { router as priceMatchingRouter } 