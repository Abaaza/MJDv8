import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { PriceMatchingService } from '../services/PriceMatchingService.js'

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
    const { jobId } = req.body
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' })
    }

    console.log(`Starting price matching for job: ${jobId}`)
    console.log(`File: ${req.file.filename}`)

    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()

    // Start processing in background with proper error handling
    priceMatchingService.processFile(jobId, req.file.path, req.file.originalname)
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
      message: 'Processing started',
      jobId 
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
    const { jobId, fileName, fileData } = req.body
    
    if (!jobId || !fileName || !fileData) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobId, fileName, fileData' 
      })
    }

    console.log(`Starting price matching for job: ${jobId}`)
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
    priceMatchingService.processFile(jobId, tempFilePath, fileName)
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
      message: 'Processing started',
      jobId 
    })

  } catch (error) {
    console.error('Process base64 endpoint error:', error)
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    })
  }
})

// Download processed results
router.get('/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    
    // Create service instance when needed (after dotenv is loaded)
    const priceMatchingService = getPriceMatchingService()
    const filePath = await priceMatchingService.getProcessedFile(jobId)
    
    if (!filePath || !await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Processed file not found' })
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

// Export filtered match results
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
    const filePath = await priceMatchingService.exportFilteredResults(jobId, matchResults)
    
    if (!filePath || !await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Export file could not be created' })
    }

    const fileName = path.basename(filePath)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

  } catch (error) {
    console.error('Export endpoint error:', error)
    res.status(500).json({ 
      error: 'Export failed',
      message: error.message 
    })
  }
})

export { router as priceMatchingRouter } 