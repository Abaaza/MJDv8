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
import { OpenAIEmbeddingService } from './OpenAIEmbeddingService.js'
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
    this.cohereMatcher = null  // Will be initialized with API key from DB
    this.openAIMatcher = null  // Will be initialized with API key from DB
    this.exportService = new ExcelExportService()
    
    // Performance optimization: Cache price list
    this.priceListCache = null
    this.priceListCacheTime = null
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    
    // Batch processing configuration
    this.BATCH_SIZE = 100
    this.MAX_CONCURRENT_BATCHES = 3
    
    // API services will be initialized when needed
    // (removed non-awaited call that was causing database overload)
  }

  async initializeAPIServices() {
    try {
      console.log('🔑 [API-INIT] Starting API services initialization...')
      console.log('🔑 [API-INIT] Supabase instance available:', !!this.supabase)
      console.log('🔑 [API-INIT] Environment:', {
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
      
      // Simple database query - let Vercel handle timeout naturally
      console.log('🔑 [API-INIT] Fetching API keys from app_settings table...')
      
      const { data: settings, error } = await this.supabase
        .from('app_settings')
        .select('cohere_api_key, openai_api_key')
        .eq('id', 1)
        .single()
      
      if (error) {
        console.error('🔑 [API-INIT] Database error:', error)
        throw new Error(`Database query failed: ${error.message}`)
      }
      
      console.log('🔑 [API-INIT] Settings fetched successfully:', {
        hasCohere: !!settings?.cohere_api_key,
        hasOpenAI: !!settings?.openai_api_key
      })

      console.log('🔑 [API-INIT] Database query completed successfully')

      if (settings) {
        // Initialize Cohere if API key is available
        if (settings.cohere_api_key) {
          console.log('🔑 [API-INIT] Initializing Cohere service...')
          try {
            this.cohereMatcher = new CohereMatchingService(settings.cohere_api_key)
            console.log('✅ Cohere API service initialized')
          } catch (cohereError) {
            console.error('🔑 [API-INIT] Cohere initialization failed:', cohereError)
          }
        } else {
          console.log('⚠️ Cohere API key not configured in admin settings')
        }

        // Initialize OpenAI if API key is available
        if (settings.openai_api_key) {
          console.log('🔑 [API-INIT] Initializing OpenAI service...')
          try {
            this.openAIMatcher = new OpenAIEmbeddingService(settings.openai_api_key)
            console.log('✅ OpenAI API service initialized')
          } catch (openaiError) {
            console.error('🔑 [API-INIT] OpenAI initialization failed:', openaiError)
          }
        } else {
          console.log('⚠️ OpenAI API key not configured in admin settings')
        }
      } else {
        console.log('⚠️ [API-INIT] No settings found in database')
      }
      
      console.log('🔑 [API-INIT] API services initialization completed')
    } catch (error) {
      console.error('❌ [API-INIT] Error initializing API services:', error)
      console.error('❌ [API-INIT] Error type:', error.constructor.name)
      
      // Try fallback to environment variables if database fails
      console.log('🔄 [API-INIT] Attempting fallback to environment variables...')
      try {
        const cohereApiKey = process.env.COHERE_API_KEY
        const openaiApiKey = process.env.OPENAI_API_KEY
        
        if (cohereApiKey || openaiApiKey) {
          console.log('✅ [API-INIT] Found API keys in environment variables')
          
          if (cohereApiKey) {
            console.log('🔑 [API-INIT] Initializing Cohere from environment...')
            this.cohereMatcher = new CohereMatchingService(cohereApiKey)
            console.log('✅ Cohere API service initialized from environment')
          }
          
          if (openaiApiKey) {
            console.log('🔑 [API-INIT] Initializing OpenAI from environment...')
            this.openAIMatcher = new OpenAIEmbeddingService(openaiApiKey)
            console.log('✅ OpenAI API service initialized from environment')
          }
          
          console.log('✅ [API-INIT] Fallback initialization completed')
        } else {
          console.log('⚠️ [API-INIT] No API keys found in environment variables either')
          console.log('⚠️ [API-INIT] Will use local matching only')
        }
      } catch (fallbackError) {
        console.error('❌ [API-INIT] Fallback initialization also failed:', fallbackError)
        console.log('⚠️ [API-INIT] Will use local matching only')
      }
      
      // Don't throw - allow processing to continue with available services
    }
  }

  async processFile(jobId, inputFilePath, originalFileName, matchingMethod = 'hybrid') {
    try {
      console.log(`🔥🔥🔥 [PROCESSFILE] *** CRITICAL: ENTERING processFile method ***`)
      console.log(`🔥 [PROCESSFILE] CRITICAL: Job ID: ${jobId}`)
      console.log(`🔥 [PROCESSFILE] CRITICAL: Input file path: ${inputFilePath}`)
      console.log(`🔥 [PROCESSFILE] CRITICAL: Original filename: ${originalFileName}`)
      console.log(`🔥 [PROCESSFILE] CRITICAL: Matching method: ${matchingMethod}`)
      console.log(`🔥 [PROCESSFILE] CRITICAL: Current time: ${new Date().toISOString()}`)
      console.log(`🔥 [PROCESSFILE] CRITICAL: Environment: Vercel=${!!process.env.VERCEL}, NodeEnv=${process.env.NODE_ENV}`)
      
      // Log memory usage for debugging
      const memUsage = process.memoryUsage()
      console.log(`🔥 [PROCESSFILE] CRITICAL: Memory usage:`, {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
      })
      
      // Initialize API services with improved timeout handling for serverless
      console.log(`🚀 [PROCESSFILE] Starting API services initialization for ${matchingMethod} matching...`)
      
      // Only initialize if we don't already have the services and we need them
      if (matchingMethod !== 'local' && (!this.cohereMatcher || !this.openAIMatcher)) {
        try {
          console.log(`🚀 [PROCESSFILE] Initializing API services for AI matching...`)
          await this.initializeAPIServices()
          console.log(`✅ [PROCESSFILE] API services initialized successfully`)
        } catch (initError) {
          console.error(`⚠️ [PROCESSFILE] API initialization failed:`, initError.message)
          console.log(`🔄 [PROCESSFILE] Falling back to local matching due to API init failure`)
          matchingMethod = 'local' // Fall back to local if API init fails
        }
      }
      
      console.log(`🚀 [PROCESSFILE] Final matching method: ${matchingMethod}`)
      console.log(`🚀 [PROCESSFILE] API services status: Cohere: ${!!this.cohereMatcher}, OpenAI: ${!!this.openAIMatcher}`)
      
      console.log(`🚀 STARTING PROCESSING: job ${jobId} with file: ${originalFileName}`)
      console.log(`📁 Input file path: ${inputFilePath}`)
      console.log(`🔧 Matching method: ${matchingMethod}`)
      
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
      await this.updateJobStatus(jobId, 'processing', 0, 'Starting file analysis...')
      console.log(`✅ Job status updated to processing`)

      // Step 1: Extract items from Excel (0-10%)
      console.log(`📊 Extracting items from Excel file...`)
      await this.updateJobStatus(jobId, 'processing', 5, 'Parsing Excel file...')
      
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
      
      // Parse Excel file directly - let Vercel handle timeout naturally
      console.log(`📊 [EXCEL-PARSE] Starting Excel parsing...`)
      console.log(`🔥 [EXCEL-PARSE] CRITICAL: About to call parseExcelFile`)
      
      let extractedItems
      try {
        extractedItems = await this.excelParser.parseExcelFile(inputFilePath, jobId, originalFileName)
        console.log(`🔥 [EXCEL-PARSE] CRITICAL: parseExcelFile completed successfully`)
        console.log(`✅ Extracted ${extractedItems.length} items from Excel`)
        
        // Log memory usage after parsing
        const memUsageAfterParsing = process.memoryUsage()
        console.log(`🔥 [EXCEL-PARSE] Memory after parsing:`, {
          rss: `${Math.round(memUsageAfterParsing.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsageAfterParsing.heapUsed / 1024 / 1024)}MB`
        })
      } catch (parseError) {
        console.error(`❌ [EXCEL-PARSE] CRITICAL: parseExcelFile failed:`, parseError)
        console.error(`❌ [EXCEL-PARSE] Error stack:`, parseError.stack)
        throw parseError
      }
      
      // Check if job was cancelled after parsing
      if (isJobCancelled(jobId)) {
        console.log(`🛑 Job ${jobId} was cancelled after parsing, stopping processing`)
        await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
        return
      }
      
      // Update progress after parsing (10%)
      await this.updateJobStatus(jobId, 'processing', 10, `Found ${extractedItems.length} items to match`, {
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
      // DON'T update progress here to avoid going backwards
      
      // Load price list directly - let Vercel handle timeout naturally
      console.log(`💰 [PRICELIST] Starting price list loading...`)
      console.log(`🔥 [PRICELIST] CRITICAL: About to call getCachedPriceList`)
      
      let priceList
      try {
        priceList = await this.getCachedPriceList()
        console.log(`🔥 [PRICELIST] CRITICAL: getCachedPriceList completed successfully`)
        console.log(`✅ Loaded ${priceList.length} price items`)
      } catch (priceListError) {
        console.error(`❌ [PRICELIST] CRITICAL: getCachedPriceList failed:`, priceListError)
        console.error(`❌ [PRICELIST] Error stack:`, priceListError.stack)
        throw priceListError
      }

      if (priceList.length === 0) {
        throw new Error('No price items found in database')
      }

      // Step 3: Match items (10% onwards - will be handled by matching method)
      console.log(`🔍 Starting price matching...`)
      
      // Check if job was cancelled before expensive matching operation
      if (isJobCancelled(jobId)) {
        console.log(`🛑 Job ${jobId} was cancelled before matching, stopping processing`)
        await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
        return
      }
      
      let matchingResult
      
      console.log(`🔥 [MATCHING] CRITICAL: About to start matching with method: ${matchingMethod}`)
      console.log(`🔥 [MATCHING] CRITICAL: Items to match: ${extractedItems.length}`)
      console.log(`🔥 [MATCHING] CRITICAL: Price items available: ${priceList.length}`)
      
      try {
        if (matchingMethod === 'local') {
          // Use local matching - need to pass updateJobStatus as 5th parameter
          console.log('🔧 [PROCESSFILE] Using local matching as requested')
          const updateJobStatus = this.updateJobStatus.bind(this)
          matchingResult = await this.localMatcher.matchItems(extractedItems, priceList, jobId, originalFileName, updateJobStatus)
        } else if (matchingMethod === 'hybrid' || matchingMethod === 'cohere') {
          // Use hybrid AI matching if both services are available, otherwise fall back
          if (this.cohereMatcher && this.openAIMatcher && matchingMethod === 'hybrid') {
            console.log('🔧 [PROCESSFILE] Using hybrid AI matching (Cohere + OpenAI)')
            matchingResult = await this.performHybridAIMatching(extractedItems, priceList, jobId, inputFilePath)
          } else if (this.cohereMatcher) {
            console.log('🔧 [PROCESSFILE] Using Cohere AI matching')
            const updateJobStatus = this.updateJobStatus.bind(this)
            matchingResult = await this.cohereMatcher.matchItems(extractedItems, priceList, jobId, updateJobStatus)
          } else {
            // If AI services not available, fall back to local matching
            console.log('⚠️ [PROCESSFILE] AI services not configured, using local matching fallback')
            const updateJobStatus = this.updateJobStatus.bind(this)
            matchingResult = await this.localMatcher.matchItems(extractedItems, priceList, jobId, originalFileName, updateJobStatus)
          }
        } else {
          // Default fallback
          console.log('⚠️ [PROCESSFILE] Unknown matching method, using local fallback')
          const updateJobStatus = this.updateJobStatus.bind(this)
          matchingResult = await this.localMatcher.matchItems(extractedItems, priceList, jobId, originalFileName, updateJobStatus)
        }
        
        console.log(`🔥 [MATCHING] CRITICAL: Matching completed successfully`)
      } catch (matchingError) {
        console.error(`❌ [MATCHING] CRITICAL: Matching failed:`, matchingError)
        console.error(`❌ [MATCHING] Error stack:`, matchingError.stack)
        throw matchingError
      }
      
      console.log(`[PRICE MATCHING DEBUG] Received matching result:`, {
        method: matchingMethod,
        totalMatched: matchingResult.totalMatched,
        averageConfidence: matchingResult.averageConfidence,
        matchesLength: matchingResult.matches?.length,
        outputPath: matchingResult.outputPath
      })
      
      console.log(`✅ Matching completed: ${matchingResult.totalMatched} matches found`)
      
      // Step 4: Save results to database (86-90%) - Ensure we don't go backwards
      console.log(`💾 Saving results to database...`)
      await this.updateJobStatus(jobId, 'processing', 86, `Found ${matchingResult.totalMatched} matches`, {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length
      })
      
      await this.saveMatchesToDatabase(jobId, matchingResult.matches)
      console.log(`✅ Results saved to database`)
      await this.updateJobStatus(jobId, 'processing', 90, 'Saving results...', {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length
      })

      // Step 5: Generate output Excel (90-95%)
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

      // Step 6: Update job with final statistics (95-100%)
      console.log(`[PRICE MATCHING DEBUG] Updating job with final stats:`, {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length,
        confidence_score: matchingResult.averageConfidence,
        output_file_path: outputPath
      })
      
      await this.updateJobStatus(jobId, 'processing', 95, 'Finalizing results...', {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length
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
      console.error(`🔥❌ [PROCESSFILE] CRITICAL: Job ${jobId} FAILED with error:`, error)
      console.error(`🔥❌ [PROCESSFILE] Error type:`, error.constructor.name)
      console.error(`🔥❌ [PROCESSFILE] Error message:`, error.message)
      console.error(`🔥❌ [PROCESSFILE] Error stack:`, error.stack)
      console.error(`🔥❌ [PROCESSFILE] Current time:`, new Date().toISOString())
      
      try {
        await this.updateJobStatus(jobId, 'failed', 0, error.message)
        console.log(`✅ [PROCESSFILE] Job status updated to failed`)
      } catch (updateError) {
        console.error(`❌ [PROCESSFILE] Failed to update job status:`, updateError)
      }
      
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
      section_header: match.section_header || null,
      match_mode: match.match_mode || 'ai' // Include match_mode field
    }))

    // Save to database in batches with enhanced error handling
    const batchSize = 500
    for (let i = 0; i < dbMatches.length; i += batchSize) {
      const batch = dbMatches.slice(i, i + batchSize)
      
      try {
        const { error } = await this.supabase
          .from('match_results')
          .insert(batch)

        if (error) {
          console.error('Error saving match results batch:', error)
          
          // If it's a schema cache issue with match_mode, try without it
          if (error.message && error.message.includes('match_mode')) {
            console.log('🔄 Schema cache issue detected. Retrying without match_mode field...')
            const batchWithoutMatchMode = batch.map(item => {
              const { match_mode, ...itemWithoutMatchMode } = item
              return itemWithoutMatchMode
            })
            
            const { error: retryError } = await this.supabase
              .from('match_results')
              .insert(batchWithoutMatchMode)
            
            if (retryError) {
              throw new Error(`Failed to save results even without match_mode: ${retryError.message}`)
            } else {
              console.log('✅ Saved batch successfully without match_mode field')
              console.log('ℹ️ Note: match_mode will be available after schema cache refresh')
            }
          } else {
            throw new Error(`Failed to save results: ${error.message}`)
          }
        } else {
          console.log(`✅ Saved batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dbMatches.length/batchSize)} successfully with match_mode`)
        }
      } catch (error) {
        console.error('Critical error saving batch:', error)
        throw error
      }
    }

    console.log(`Successfully saved ${matches.length} matches to database`)
  }

  /**
   * Update job status in database
   */
  async updateJobStatus(jobId, status, progress = 0, message = '', extraData = {}) {
    try {
      // Debug logging to track progress updates
      console.log(`🔄 [DATABASE] ENTERING updateJobStatus for job ${jobId}: status=${status}, progress=${progress}`)
      if (message) {
        console.log(`🔄 [DATABASE] Message: ${message}`)
      }
      
      // Get current job status for debugging
      const currentJobStatus = await this.getJobStatus(jobId)
      console.log(`🔄 [DATABASE] Current job status before update:`, {
        status: currentJobStatus?.status,
        progress: currentJobStatus?.progress,
        updated_at: currentJobStatus?.updated_at
      })
      
      // Special logging for Cohere progress
      if (message.includes('Cohere:')) {
        console.log(`🔄 [DATABASE] *** COHERE PROGRESS UPDATE *** ${progress}%: ${message}`)
      }
      
      // Add stack trace for debugging unexpected progress jumps
      if (progress > 60 && progress < 90 && !message.includes('Matching items')) {
        console.log('   Stack trace for unexpected progress:', new Error().stack.split('\n').slice(2, 4).join('\n'))
      }
      
      // Define final states that should not be overwritten
      const finalStates = ['stopped', 'completed', 'failed', 'cancelled']
      
      // If we're trying to update a job, first check its current status to prevent overwrites
      if (!finalStates.includes(status)) {
        // For non-final status updates, check if the job is already in a final state
        const currentJob = await this.getJobStatus(jobId)
        if (currentJob && finalStates.includes(currentJob.status)) {
          console.log(`🛡️ [DATABASE] Blocking status update for job ${jobId}: current status '${currentJob.status}' is final, ignoring '${status}' update`)
          return false // Don't update if job is already in a final state
        }
        
        // Additional protection: Don't allow progress to go backwards on active jobs
        if (currentJob && currentJob.status === 'processing' && typeof currentJob.progress === 'number') {
          if (progress < currentJob.progress && !message.includes('Computing embeddings')) {
            console.log(`🛡️ [DATABASE] Blocking backward progress for job ${jobId}: ${progress}% < ${currentJob.progress}%`)
            return false
          }
        }
      }
      
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }
      
      if (progress !== undefined) {
        updateData.progress = Math.min(100, Math.max(0, progress))
      }
      
      if (message) {
        updateData.error_message = message
      }
      
      // Merge any extra data
      Object.assign(updateData, extraData)
      
      // For final states, use a more robust update that prevents overwrites
      if (finalStates.includes(status)) {
        console.log(`🛡️ [DATABASE] Final status update for job ${jobId}: ${status}`)
        
        // Use conditional update to prevent overwriting final states
        const { data, error } = await this.supabase
          .from('ai_matching_jobs')
          .update(updateData)
          .eq('id', jobId)
          .not('status', 'in', `(${finalStates.filter(s => s !== status).join(',')})`) // Don't update if already in another final state
          .select()
          .single()
        
        if (error) {
          console.error('❌ [DATABASE] Error updating job status:', error)
          return false
        } else if (!data) {
          console.log(`ℹ️ [DATABASE] Job ${jobId} was not updated - likely already in a final state`)
          return false
        } else {
          console.log(`✅ [DATABASE] Final status update successful for job ${jobId}: ${status}`)
          return true
        }
      } else {
        // For non-final states, use regular update with additional protections
        const { error } = await this.supabase
          .from('ai_matching_jobs')
          .update(updateData)
          .eq('id', jobId)
          .in('status', ['pending', 'processing']) // Only update if job is in an active state
        
        if (error) {
          console.error('❌ [DATABASE] Error updating job status:', error)
          return false
        } else {
          // Log successful database updates for Cohere
          if (message.includes('Cohere:')) {
            console.log(`✅ [DATABASE] Cohere progress saved: ${progress}%`)
          }
          return true
        }
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
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

  /**
   * Perform hybrid AI matching using both Cohere and OpenAI
   */
  async performHybridAIMatching(boqItems, priceList, jobId, inputFilePath) {
    console.log('🤖 Starting HYBRID AI matching (Cohere + OpenAI)...')
    
    // Track current progress to ensure monotonic increases
    let currentProgress = 10
    
    // Create a custom update function that prevents duplicate messages and ensures monotonic progress
    const lastProgressByService = {
      openai: { message: '', time: 0, progress: 0 },
      cohere: { message: '', time: 0, progress: 0 },
      general: { message: '', time: 0, progress: 0 }
    }
    
    const updateJobStatusWithThrottle = async (jobId, status, progress, message, extraData = {}) => {
      // Ensure progress never goes backward
      if (progress <= currentProgress && !message.includes('Computing embeddings')) {
        console.log(`🛡️ [PROGRESS] Blocking backward progress: ${progress}% <= ${currentProgress}%`)
        return
      }
      
      // Update current progress
      if (progress > currentProgress) {
        currentProgress = progress
      }
      
      // Determine which service this message is from
      let serviceKey = 'general'
      if (message.includes('OpenAI:')) serviceKey = 'openai'
      else if (message.includes('Cohere:')) serviceKey = 'cohere'
      
      // For embedding progress, we want to show every batch, not throttle them
      const isEmbeddingProgress = message.includes('Computing embeddings') || message.includes('embeddings... batch')
      
      // NEVER throttle embedding progress messages - always show them
      if (isEmbeddingProgress) {
        await this.updateJobStatus(jobId, status, progress, message, extraData)
        return
      }
      
      // Only throttle non-embedding messages
      const now = Date.now()
      const lastProgress = lastProgressByService[serviceKey]
      
      if (message === lastProgress.message && (now - lastProgress.time) < 2000) {
        return // Skip duplicate
      }
      
      lastProgress.message = message
      lastProgress.time = now
      lastProgress.progress = progress
      await this.updateJobStatus(jobId, status, progress, message, extraData)
    }
    
    // Pre-compute embeddings for both services
    await this.updateJobStatus(jobId, 'processing', 10, 'Initializing AI services...')
    
    // Create a wrapper that properly tracks embedding progress with FIXED ranges
    const createEmbeddingProgressTracker = (serviceType, startProgress, endProgress) => {
      return {
        updateJobStatus: async (jobId, status, serviceProgress, message, extraData = {}) => {
          // Map service's internal progress (0-100) to our range
          const actualProgress = startProgress + Math.round((serviceProgress / 100) * (endProgress - startProgress))
          // Ensure we don't exceed the end progress
          const clampedProgress = Math.min(actualProgress, endProgress)
          
          // Add service prefix to message
          const prefixedMessage = `${serviceType === 'openai' ? 'OpenAI' : 'Cohere'}: ${message}`
          // Ensure extraData is always an object
          const safeExtraData = extraData || {}
          
          // Log progress mapping for debugging
          console.log(`📊 [${serviceType.toUpperCase()} WRAPPER] ${serviceProgress}% → ${clampedProgress}% | ${message}`)
          
          await updateJobStatusWithThrottle(jobId, status, clampedProgress, prefixedMessage, safeExtraData)
        }
      }
    }
    
    // FIXED progress ranges to prevent overlaps:
    // OpenAI embedding progress: 10-30%
    const openaiProgressTracker = createEmbeddingProgressTracker('openai', 10, 30)
    
    // Cohere embedding progress: 30-50%
    const cohereProgressTracker = createEmbeddingProgressTracker('cohere', 30, 50)
    
    // Import cancellation checker
    const { isJobCancelled } = await import('../routes/priceMatching.js')
    
    // Pre-compute embeddings sequentially to show clear progress
    console.log('📊 Computing OpenAI embeddings...')
    const openaiStart = Date.now()
    
    // Check if job was cancelled before OpenAI
    if (isJobCancelled(jobId)) {
      console.log(`🛑 Job ${jobId} was cancelled before OpenAI embeddings`)
      await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
      return { matches: [], totalMatched: 0, averageConfidence: 0, outputPath: null }
    }
    
    await this.openAIMatcher.precomputePriceListEmbeddings(priceList, jobId, openaiProgressTracker)
    console.log(`✅ OpenAI embeddings completed in ${((Date.now() - openaiStart) / 1000).toFixed(1)}s`)
    
    // Update to exactly 30% after OpenAI completion
    await updateJobStatusWithThrottle(jobId, 'processing', 30, 'OpenAI embeddings completed')
    
    // Check if job was cancelled after OpenAI but before Cohere
    if (isJobCancelled(jobId)) {
      console.log(`🛑 Job ${jobId} was cancelled after OpenAI, before Cohere embeddings`)
      await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
      return { matches: [], totalMatched: 0, averageConfidence: 0, outputPath: null }
    }
    
    console.log('📊 Computing Cohere embeddings...')
    const cohereStart = Date.now()
    try {
      await this.cohereMatcher.precomputePriceListEmbeddings(priceList, jobId, cohereProgressTracker)
      console.log(`✅ Cohere embeddings completed in ${((Date.now() - cohereStart) / 1000).toFixed(1)}s`)
    } catch (cohereError) {
      console.error(`❌ Cohere embeddings failed:`, cohereError);
      await this.updateJobStatus(jobId, 'failed', 35, `Cohere embeddings failed: ${cohereError.message}`)
      throw cohereError; // Re-throw to stop processing
    }
    
    // Update to exactly 50% after Cohere completion
    await updateJobStatusWithThrottle(jobId, 'processing', 50, 'Cohere embeddings completed')
    
    // Check if job was cancelled after embeddings but before matching
    if (isJobCancelled(jobId)) {
      console.log(`🛑 Job ${jobId} was cancelled after embeddings, before matching`)
      await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
      return { matches: [], totalMatched: 0, averageConfidence: 0, outputPath: null }
    }
    
    await updateJobStatusWithThrottle(jobId, 'processing', 55, 'AI embeddings ready, starting matching...')
    
    // Create matching progress trackers (55-85%) - FIXED range
    let cohereMatchProgress = 0
    let openaiMatchProgress = 0
    let cohereMatchCount = 0
    let openaiMatchCount = 0
    let lastUpdateTime = 0
    
    const createMatchingProgressTracker = (serviceName) => {
      return async (jobId, status, serviceProgress, message, extraData) => {
        if (serviceName === 'cohere') {
          cohereMatchProgress = serviceProgress
          if (extraData?.matched_items) cohereMatchCount = extraData.matched_items
        } else {
          openaiMatchProgress = serviceProgress
          if (extraData?.matched_items) openaiMatchCount = extraData.matched_items
        }
        
        // Only update if enough time has passed (throttle to every 500ms)
        const now = Date.now()
        if (now - lastUpdateTime < 500) return
        lastUpdateTime = now
        
        // Calculate combined progress for matching phase (55-85%)
        const avgProgress = (cohereMatchProgress + openaiMatchProgress) / 2 // Average of both
        const actualProgress = 55 + Math.round((avgProgress / 100) * 30) // Map to 55-85% range
        
        // Ensure monotonic progress
        if (actualProgress <= currentProgress) return
        
        // Show both services' match counts
        const cohereMsg = cohereMatchCount > 0 ? `Cohere: ${cohereMatchCount}` : ''
        const openaiMsg = openaiMatchCount > 0 ? `OpenAI: ${openaiMatchCount}` : ''
        const matchesMsg = [cohereMsg, openaiMsg].filter(m => m).join(', ') || '0'
        
        await updateJobStatusWithThrottle(
          jobId, 
          status, 
          actualProgress, 
          `Matching items... (${matchesMsg} matches found)`,
          { 
            ...extraData, 
            matched_items: Math.max(cohereMatchCount, openaiMatchCount),
            total_items: extraData?.total_items || 0
          }
        )
      }
    }
    
    const cohereMatchUpdater = createMatchingProgressTracker('cohere')
    const openaiMatchUpdater = createMatchingProgressTracker('openai')
    
    // Run both AI matchers in parallel with coordinated progress
    console.log('🔄 Running parallel AI matching...')
    const [cohereResult, openaiResult] = await Promise.all([
      this.cohereMatcher.matchItems(boqItems, priceList, jobId, cohereMatchUpdater),
      this.openAIMatcher.matchItems(boqItems, priceList, jobId, openaiMatchUpdater)
    ])
    
    console.log(`📊 Cohere Results: ${cohereResult.totalMatched}/${boqItems.length} matched`)
    console.log(`📊 OpenAI Results: ${openaiResult.totalMatched}/${boqItems.length} matched`)
    
    await updateJobStatusWithThrottle(jobId, 'processing', 85, 'Combining AI results...')
    
    // Combine results using intelligent merging
    const hybridMatches = this.combineAIResults(cohereResult.matches, openaiResult.matches)
    
    // Calculate final statistics
    const totalMatched = hybridMatches.filter(m => m.matched).length
    const avgConfidence = totalMatched > 0
      ? hybridMatches.filter(m => m.matched).reduce((sum, m) => sum + m.confidence, 0) / totalMatched
      : 0
    
    console.log(`✅ Hybrid matching completed: ${totalMatched}/${boqItems.length} matched`)
    console.log(`📊 Average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
    
    // Extract original filename from inputFilePath
    const originalFileName = path.basename(inputFilePath)
    
    // Generate output file
    const outputPath = await this.exportService.exportWithOriginalFormat(
      inputFilePath,
      hybridMatches,
      jobId,
      originalFileName
    )
    
    // Final progress update to 85% (will be increased to 90% by main processFile method)
    await updateJobStatusWithThrottle(jobId, 'processing', 85, 'Hybrid AI matching completed')
    
    return {
      matches: hybridMatches,
      totalMatched,
      averageConfidence: Math.round(avgConfidence * 100),
      outputPath
    }
  }

  /**
   * Intelligently combine results from multiple AI services
   */
  combineAIResults(cohereMatches, openaiMatches) {
    const combinedMatches = []
    
    for (let i = 0; i < cohereMatches.length; i++) {
      const cohereMatch = cohereMatches[i]
      const openaiMatch = openaiMatches[i]
      
      // If both found matches
      if (cohereMatch.matched && openaiMatch.matched) {
        // If they matched the same item, this is high confidence
        if (cohereMatch.matched_price_item_id === openaiMatch.matched_price_item_id) {
          // Take the average confidence and boost it
          const avgConfidence = (cohereMatch.confidence + openaiMatch.confidence) / 2
          const boostedConfidence = Math.min(1, avgConfidence + 0.2) // +20% boost for agreement
          
          combinedMatches.push({
            ...cohereMatch,
            confidence: boostedConfidence,
            match_method: 'hybrid_agreement',
            hybrid_details: {
              cohere_confidence: cohereMatch.confidence,
              openai_confidence: openaiMatch.confidence,
              agreement: true,
              boost_applied: 0.2
            }
          })
        } else {
          // Different matches - use weighted decision
          // Consider: confidence, category match, unit match
          
          let cohereScore = cohereMatch.confidence
          let openaiScore = openaiMatch.confidence
          
          // Check unit matching
          const boqUnit = cohereMatch.unit?.toLowerCase() || ''
          if (cohereMatch.matched_unit?.toLowerCase() === boqUnit) cohereScore += 0.1
          if (openaiMatch.matched_unit?.toLowerCase() === boqUnit) openaiScore += 0.1
          
          // Check if description contains key terms
          const description = cohereMatch.description?.toLowerCase() || ''
          const cohereDesc = cohereMatch.matched_description?.toLowerCase() || ''
          const openaiDesc = openaiMatch.matched_description?.toLowerCase() || ''
          
          // Calculate word overlap
          const words = description.split(/\s+/).filter(w => w.length > 3)
          const cohereWords = words.filter(w => cohereDesc.includes(w)).length
          const openaiWords = words.filter(w => openaiDesc.includes(w)).length
          
          cohereScore += cohereWords * 0.05
          openaiScore += openaiWords * 0.05
          
          // Choose the better match
          if (cohereScore >= openaiScore) {
            combinedMatches.push({
              ...cohereMatch,
              confidence: Math.min(1, cohereScore),
              match_method: 'hybrid_cohere_selected',
              hybrid_details: {
                cohere_confidence: cohereMatch.confidence,
                openai_confidence: openaiMatch.confidence,
                cohere_score: cohereScore,
                openai_score: openaiScore,
                agreement: false,
                selected: 'cohere'
              }
            })
          } else {
            combinedMatches.push({
              ...openaiMatch,
              confidence: Math.min(1, openaiScore),
              match_method: 'hybrid_openai_selected',
              hybrid_details: {
                cohere_confidence: cohereMatch.confidence,
                openai_confidence: openaiMatch.confidence,
                cohere_score: cohereScore,
                openai_score: openaiScore,
                agreement: false,
                selected: 'openai'
              }
            })
          }
        }
      }
      // If only Cohere found a match
      else if (cohereMatch.matched && !openaiMatch.matched) {
        // Slightly reduce confidence since only one model found it
        combinedMatches.push({
          ...cohereMatch,
          confidence: Math.max(0.01, cohereMatch.confidence * 0.9),
          match_method: 'cohere_only',
          hybrid_details: {
            cohere_confidence: cohereMatch.confidence,
            openai_confidence: 0,
            single_model: true
          }
        })
      }
      // If only OpenAI found a match
      else if (!cohereMatch.matched && openaiMatch.matched) {
        // Slightly reduce confidence since only one model found it
        combinedMatches.push({
          ...openaiMatch,
          confidence: Math.max(0.01, openaiMatch.confidence * 0.9),
          match_method: 'openai_only',
          hybrid_details: {
            cohere_confidence: 0,
            openai_confidence: openaiMatch.confidence,
            single_model: true
          }
        })
      }
      // Neither found a match - shouldn't happen with our always-match logic
      else {
        combinedMatches.push({
          ...cohereMatch,
          matched: false,
          confidence: 0,
          match_method: 'no_match',
          hybrid_details: {
            cohere_confidence: 0,
            openai_confidence: 0,
            no_match: true
          }
        })
      }
    }
    
    // Log summary statistics
    const agreementCount = combinedMatches.filter(m => m.hybrid_details?.agreement).length
    const cohereOnlyCount = combinedMatches.filter(m => m.match_method === 'cohere_only').length
    const openaiOnlyCount = combinedMatches.filter(m => m.match_method === 'openai_only').length
    
    console.log(`📊 Hybrid Matching Summary:`)
    console.log(`   - Agreement: ${agreementCount} items (${(agreementCount / combinedMatches.length * 100).toFixed(1)}%)`)
    console.log(`   - Cohere only: ${cohereOnlyCount} items`)
    console.log(`   - OpenAI only: ${openaiOnlyCount} items`)
    console.log(`   - Average confidence: ${(combinedMatches.reduce((sum, m) => sum + m.confidence, 0) / combinedMatches.length * 100).toFixed(1)}%`)
    
    return combinedMatches
  }
} 