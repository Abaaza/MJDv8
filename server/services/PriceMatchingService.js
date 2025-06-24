import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import ExcelJS from 'exceljs'
import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { ExcelParsingService } from './ExcelParsingService.js'
import { LocalPriceMatchingService } from './LocalPriceMatchingService.js'
import { CohereMatchingService } from './CohereMatchingService.js'
import { ExcelExportService } from './ExcelExportService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class PriceMatchingService {
  constructor() {
    // Use service role key for admin access (bypasses RLS)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in environment')
    }
    
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      supabaseKey
    )
    
    // Use /tmp for serverless, local output dir otherwise
    this.outputDir = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME 
        ? '/tmp' 
        : path.join(__dirname, '..', 'output')
    this.tempDir = path.join(__dirname, '..', 'temp')
    this.pythonScriptPath = path.join(__dirname, 'cohereexcelparsing.py')
    this.pricelistPath = path.join(__dirname, '..', 'temp', 'pricelist.xlsx')
    
    // Initialize services
    this.excelParser = new ExcelParsingService()
    this.localMatcher = new LocalPriceMatchingService()
    this.cohereMatcher = new CohereMatchingService()
    this.exportService = new ExcelExportService()
    
    // Performance optimization: Cache price list
    this.priceListCache = null
    this.priceListCacheTime = null
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    
    // Batch processing configuration
    this.BATCH_SIZE = 100
    this.MAX_CONCURRENT_BATCHES = 3
  }

  async processFile(jobId, inputFilePath, originalFileName, matchingMethod = 'cohere') {
    try {
      console.log(`🚀 STARTING PROCESSING: job ${jobId} with file: ${originalFileName}`)
      console.log(`📁 Input file path: ${inputFilePath}`)
      
      // Import cancellation checker
      const { isJobCancelled } = await import('../routes/priceMatching.js')
      
      // Check if job was cancelled before starting
      if (isJobCancelled(jobId)) {
        console.log(`🛑 Job ${jobId} was cancelled, stopping processing`)
        await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
        return
      }
      
      // Verify input file exists
      if (!await fs.pathExists(inputFilePath)) {
        throw new Error(`Input file does not exist: ${inputFilePath}`)
      }
      console.log(`✅ Input file verified: ${inputFilePath}`)
      
      // Update job status to processing
      console.log(`📊 Updating job status to processing...`)
      await this.updateJobStatus(jobId, 'processing', 5, 'Starting file analysis...')
      console.log(`✅ Job status updated to processing`)

      // Step 1: Extract items from Excel
      console.log(`📊 Extracting items from Excel file...`)
      await this.updateJobStatus(jobId, 'processing', 10, 'Parsing Excel file...')
      
      // Store the original input file path in the job record
      console.log(`[PRICE MATCHING DEBUG] Storing original input file path: ${inputFilePath}`)
      
      const { data: jobData } = await this.supabase
        .from('ai_matching_jobs')
        .select('input_file_blob_key')
        .eq('id', jobId)
        .single()
      
      const updateData = {
        original_file_path: inputFilePath
      }
      
      if (jobData?.input_file_blob_key) {
        updateData.input_file_blob_key = jobData.input_file_blob_key
      }
      
      const { error: pathUpdateError } = await this.supabase
        .from('ai_matching_jobs')
        .update(updateData)
        .eq('id', jobId)
      
      if (pathUpdateError) {
        console.error('[PRICE MATCHING DEBUG] Error storing original file path:', pathUpdateError)
      } else {
        console.log('[PRICE MATCHING DEBUG] Successfully stored original file path and blob key')
      }
      
      const extractedItems = await this.excelParser.parseExcelFile(inputFilePath, jobId, originalFileName)
      console.log(`✅ Extracted ${extractedItems.length} items from Excel`)
      
      // Check if job was cancelled after parsing
      if (isJobCancelled(jobId)) {
        console.log(`🛑 Job ${jobId} was cancelled after parsing, stopping processing`)
        await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
        return
      }
      
      // Update progress after parsing
      await this.updateJobStatus(jobId, 'processing', 20, `Found ${extractedItems.length} items to match`, {
        total_items: extractedItems.length,
        matched_items: 0
      })
      
      if (extractedItems.length === 0) {
        console.log(`⚠️ No items found! Checking file structure...`)
        const debugWorkbook = XLSX.readFile(inputFilePath)
        console.log(`   - Sheets found: ${debugWorkbook.SheetNames.join(', ')}`)
        for (const sheetName of debugWorkbook.SheetNames) {
          const sheet = debugWorkbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
          console.log(`   - Sheet "${sheetName}" has ${data.length} rows`)
          if (data.length > 0) {
            console.log(`   - First row sample:`, data[0])
          }
        }
        throw new Error('No items with quantities found in the Excel file. Please check the file format.')
      }

      // Step 2: Load price list from database
      console.log(`💰 Loading price list from database...`)
      await this.updateJobStatus(jobId, 'processing', 30, 'Loading price database...')
      const priceList = await this.getCachedPriceList()
      console.log(`✅ Loaded ${priceList.length} price items`)
      await this.updateJobStatus(jobId, 'processing', 45, `Preparing to match against ${priceList.length} price items`)

      if (priceList.length === 0) {
        throw new Error('No price items found in database')
      }

      // Step 3: Match items
      console.log(`🔍 Starting price matching...`)
      
      // Check if job was cancelled before expensive matching operation
      if (isJobCancelled(jobId)) {
        console.log(`🛑 Job ${jobId} was cancelled before matching, stopping processing`)
        await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
        return
      }
      
      let matchingResult
      
      if (matchingMethod === 'local') {
        // Use local matching
        matchingResult = await this.localMatcher.matchItems(extractedItems, priceList, jobId, originalFileName)
      } else {
        // Use Cohere AI matching (default)
        matchingResult = await this.cohereMatcher.matchItems(extractedItems, priceList, jobId, originalFileName)
      }
      
      console.log(`[PRICE MATCHING DEBUG] Received matching result:`, {
        method: matchingMethod,
        totalMatched: matchingResult.totalMatched,
        averageConfidence: matchingResult.averageConfidence,
        matchesLength: matchingResult.matches?.length,
        outputPath: matchingResult.outputPath
      })
      
      console.log(`✅ Matching completed: ${matchingResult.totalMatched} matches found`)
      await this.updateJobStatus(jobId, 'processing', 80, `Found ${matchingResult.totalMatched} matches`, {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length
      })

      // Step 4: Save results to database
      console.log(`💾 Saving results to database...`)
      await this.saveMatchesToDatabase(jobId, matchingResult.matches)
      console.log(`✅ Results saved to database`)
      await this.updateJobStatus(jobId, 'processing', 90, 'Saving results...', {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length
      })

      // Step 5: Generate output Excel
      console.log(`📄 Generating output Excel file...`)
      let outputPath = matchingResult.outputPath
      
      // If no output path, create one with ExcelExportService
      if (!outputPath || matchingResult.totalMatched === 0) {
        console.log(`📄 Creating Excel output with original format...`)
        outputPath = await this.exportService.exportWithOriginalFormat(
          inputFilePath, 
          matchingResult.matches || [], 
          jobId, 
          originalFileName
        )
        console.log(`✅ Created output file: ${outputPath}`)
      }

      // Step 6: Update job with final statistics
      console.log(`[PRICE MATCHING DEBUG] Updating job with final stats:`, {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length,
        confidence_score: matchingResult.averageConfidence,
        output_file_path: outputPath
      })
      
      const { error: updateError } = await this.supabase
        .from('ai_matching_jobs')
        .update({
          matched_items: matchingResult.totalMatched,
          total_items: extractedItems.length,
          confidence_score: matchingResult.averageConfidence,
          output_file_path: outputPath
        })
        .eq('id', jobId)
      
      if (updateError) {
        console.error('[PRICE MATCHING DEBUG] Error updating job:', updateError)
      }

      await this.updateJobStatus(jobId, 'completed', 100)
      console.log(`🎉 Job ${jobId} COMPLETED successfully`)

      // Cleanup temp files
      console.log(`🧹 Cleaning up temp files...`)
      await this.cleanup(inputFilePath)
      console.log(`✅ Cleanup completed`)

      console.log(`✅ Job ${jobId} completed successfully`)
      return outputPath

    } catch (error) {
      console.error(`❌ Job ${jobId} FAILED with error:`, error)
      console.error(`❌ Error stack:`, error.stack)
      await this.updateJobStatus(jobId, 'failed', 0, error.message)
      throw error
    }
  }

  async getCachedPriceList() {
    const now = Date.now()
    
    // Check if cache is valid
    if (this.priceListCache && this.priceListCacheTime && 
        (now - this.priceListCacheTime) < this.CACHE_DURATION) {
      console.log('📦 Using cached price list')
      return this.priceListCache
    }
    
    // Fetch fresh data
    console.log('🔄 Fetching fresh price list...')
    const priceList = await this.loadPriceList()
    
    // Update cache
    this.priceListCache = priceList
    this.priceListCacheTime = now
    
    return priceList
  }

  async loadPriceList() {
    console.log('Loading price list from database...')
    
    let allPriceItems = []
    const batchSize = 1000
    let hasMore = true
    
    // First, get total count for progress tracking
    const { count, error: countError } = await this.supabase
      .from('price_items')
      .select('*', { count: 'exact', head: true })
      .not('rate', 'is', null)
      .not('description', 'is', null)
    
    if (countError) {
      console.warn('Could not get count, proceeding with batch loading...')
    } else {
      console.log(`📊 Total price items to load: ${count}`)
    }
    
    // Load multiple batches in parallel for better performance
    const maxParallelBatches = 3
    let currentOffset = 0
    
    while (hasMore) {
      // Create parallel batch requests
      const batchPromises = []
      const batchOffsets = []
      
      for (let i = 0; i < maxParallelBatches && hasMore; i++) {
        const offset = currentOffset + (i * batchSize)
        batchOffsets.push(offset)
        
        const batchPromise = this.supabase
          .from('price_items')
          .select('*')
          .not('rate', 'is', null)
          .not('description', 'is', null)
          .range(offset, offset + batchSize - 1)
        
        batchPromises.push(batchPromise)
      }
      
      // Execute batches in parallel
      const batchResults = await Promise.all(batchPromises)
      
      // Process results
      let totalItemsInBatch = 0
      for (let i = 0; i < batchResults.length; i++) {
        const { data: batch, error } = batchResults[i]
        
        if (error) {
          console.error(`Error loading batch at offset ${batchOffsets[i]}:`, error)
          throw new Error(`Failed to fetch price items: ${error.message}`)
        }
        
        if (batch && batch.length > 0) {
          allPriceItems = [...allPriceItems, ...batch]
          totalItemsInBatch += batch.length
          
          // If we got less than batchSize, we've reached the end
          if (batch.length < batchSize) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }
      
      currentOffset += maxParallelBatches * batchSize
      console.log(`📦 Loaded batch: ${allPriceItems.length} items so far...`)
      
      // Break if no items were loaded in any batch
      if (totalItemsInBatch === 0) {
        hasMore = false
      }
    }

    if (!allPriceItems || allPriceItems.length === 0) {
      throw new Error('No price items found in database')
    }

    console.log(`✅ Loaded total of ${allPriceItems.length} price items from database`)
    return allPriceItems
  }

  async saveMatchesToDatabase(jobId, matches) {
    console.log(`Saving ${matches.length} matches to database...`)
    
    if (matches.length === 0) {
      console.log('No matches to save')
      return
    }

    // Transform matches for database
    const dbMatches = matches.map(match => ({
      job_id: jobId,
      sheet_name: match.sheet_name,
      row_number: match.row_number,
      original_description: match.original_description,
      preprocessed_description: match.original_description.toLowerCase().trim(),
      matched_description: match.matched_description,
      matched_rate: match.matched_rate,
      similarity_score: match.similarity_score,
      quantity: match.quantity,
      matched_price_item_id: match.matched_price_item_id,
      section_header: match.section_header || null
    }))

    // Save to database in batches
    const batchSize = 500
    for (let i = 0; i < dbMatches.length; i += batchSize) {
      const batch = dbMatches.slice(i, i + batchSize)
      const { error } = await this.supabase
        .from('match_results')
        .insert(batch)

      if (error) {
        console.error('Error saving match results batch:', error)
        throw new Error(`Failed to save results: ${error.message}`)
      }
    }

    console.log(`Successfully saved ${matches.length} matches to database`)
  }

  /**
   * Update job status in database
   */
  async updateJobStatus(jobId, status, progress = null, message = null, extraData = {}) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }

      // Properly merge extraData
      if (extraData && typeof extraData === 'object') {
        Object.assign(updateData, extraData)
      }

      if (progress !== null) {
        updateData.progress = progress
      }

      if (message !== null) {
        updateData.error_message = message ? message.substring(0, 500) : null
      }

      console.log(`🔄 Updating job ${jobId}: status=${status}, progress=${progress}`)

      const { error } = await this.supabase
        .from('ai_matching_jobs')
        .update(updateData)
        .eq('id', jobId)

      if (error) {
        console.error(`❌ Failed to update job ${jobId}:`, error)
        return false
      }

      return true

    } catch (error) {
      console.error(`❌ Error updating job status for ${jobId}:`, error)
      return false
    }
  }

  /**
   * Clean up temporary files after processing
   */
  async cleanup(filePath) {
    try {
      console.log(`🧹 Checking file for cleanup: ${filePath}`)
      
      if (!filePath) {
        console.log('No file path provided for cleanup')
        return
      }

      // Don't delete original input files - they're needed for export format preservation
      const fileName = path.basename(filePath)
      if (fileName.includes('job-') && !fileName.includes('output') && !fileName.includes('result')) {
        console.log(`📄 Preserving original input file for export: ${filePath}`)
        return
      }

      // Check if file exists before trying to delete
      try {
        await fs.access(filePath)
        await fs.unlink(filePath)
        console.log(`✅ Successfully deleted temporary file: ${filePath}`)
      } catch (accessError) {
        if (accessError.code === 'ENOENT') {
          console.log(`📁 File already removed or doesn't exist: ${filePath}`)
        } else {
          console.warn(`⚠️ Could not access file for cleanup: ${accessError.message}`)
        }
      }
    } catch (error) {
      console.error(`❌ Error during cleanup: ${error.message}`)
      // Don't throw error - cleanup failure shouldn't break the entire job
    }
  }

  /**
   * Get job status from database
   */
  async getJobStatus(jobId) {
    try {
      const { data, error } = await this.supabase
        .from('ai_matching_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error('Error fetching job status:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getJobStatus:', error)
      return null
    }
  }
} 