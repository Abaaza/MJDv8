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
      
      // Update job status to processing - show initial progress at 10%
      console.log(`📊 Updating job status to processing...`)
      await this.updateJobStatus(jobId, 'processing', 5, 'Starting file analysis...') // Start at 10%
      console.log(`✅ Job status updated to processing`)

      // Step 1: Extract items from Excel - show progress at 20%
      console.log(`📊 Extracting items from Excel file...`)
      await this.updateJobStatus(jobId, 'processing', 10, 'Parsing Excel file...')
      
      // Store the original input file path and blob key in the job record
      console.log(`[PRICE MATCHING DEBUG] Storing original input file path: ${inputFilePath}`)
      
      // Also store the blob key if available for better reliability
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
      
      // Update progress to 30% after parsing
      await this.updateJobStatus(jobId, 'processing', 20, `Found ${extractedItems.length} items to match`, {
        total_items: extractedItems.length,
        matched_items: 0
      })
      // Skip the parsing complete update - go straight to matching phase
      
      // Start progress updates only when matching begins - ensure total_items is set from the start
      await this.updateJobStatus(jobId, 'processing', 20, `Starting to match ${extractedItems.length} items`, {
        total_items: extractedItems.length,
        matched_items: 0
      })
      
      if (extractedItems.length === 0) {
        // Try to understand why no items were found
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

      // Step 3: Match items using Cohere AI matching
      console.log(`🔍 Starting AI price matching...`)
      
      // Check if job was cancelled before expensive matching operation
      if (isJobCancelled(jobId)) {
        console.log(`🛑 Job ${jobId} was cancelled before matching, stopping processing`)
        await this.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
        return
      }
      
      let matchingResult
      
      if (matchingMethod === 'cohere' || !matchingMethod) {
        matchingResult = await this.cohereMatcher.matchItems(extractedItems, priceList, jobId, originalFileName)
      } else {
        // Always use Cohere for any other method
        console.log(`⚠️ Warning: Unsupported matching method '${matchingMethod}', using Cohere AI instead`)
        matchingResult = await this.cohereMatcher.matchItems(extractedItems, priceList, jobId, originalFileName)
      }
      
      console.log(`[PRICE MATCHING DEBUG] Received matching result:`, {
        method: matchingMethod,
        totalMatched: matchingResult.totalMatched,
        averageConfidence: matchingResult.averageConfidence,
        matchesLength: matchingResult.matches?.length,
        outputPath: matchingResult.outputPath
      })
      
      console.log(`✅ AI matching completed: ${matchingResult.totalMatched} matches found`)
      console.log(`[PRICE MATCHING DEBUG] Output path: ${matchingResult.outputPath}`)
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

      // Step 5: Generate output Excel even if no matches were found
      console.log(`📄 Generating output Excel file...`)
      let outputPath = matchingResult.outputPath
      
      // If no output path (e.g., no matches), create one with ExcelExportService
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
      
      // First try to update with output_file_path
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
        console.error('[PRICE MATCHING DEBUG] Error updating job with output_file_path:', updateError)
        
        // If it fails (likely due to missing column), update without output_file_path
        console.log('[PRICE MATCHING DEBUG] Retrying update without output_file_path...')
        const { error: fallbackError } = await this.supabase
          .from('ai_matching_jobs')
          .update({
            matched_items: matchingResult.totalMatched,
            total_items: extractedItems.length,
            confidence_score: matchingResult.averageConfidence
          })
          .eq('id', jobId)
        
        if (fallbackError) {
          console.error('[PRICE MATCHING DEBUG] Fallback update also failed:', fallbackError)
        } else {
          console.log('[PRICE MATCHING DEBUG] Successfully updated job stats (without output_file_path)')
        }
      }
      
      // Verify the update worked
      const { data: updatedJob, error: verifyError } = await this.supabase
        .from('ai_matching_jobs')
        .select('matched_items, total_items, confidence_score, output_file_path')
        .eq('id', jobId)
        .single()
      
      if (verifyError) {
        console.error('[PRICE MATCHING DEBUG] Error verifying job update:', verifyError)
      } else {
        console.log('[PRICE MATCHING DEBUG] Job after update:', {
          matched_items: updatedJob.matched_items,
          total_items: updatedJob.total_items,
          confidence_score: updatedJob.confidence_score,
          output_file_path: updatedJob.output_file_path
        })
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
    const batchSize = 1000 // Increased batch size for better performance
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
          .select('id, description, rate, full_context, unit')
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
      console.log(`📦 Loaded batch: ${allPriceItems.length} items so far (${totalItemsInBatch} in this batch)...`)
      
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

    // Save to database
    const { error } = await this.supabase
      .from('match_results')
      .insert(dbMatches)

    if (error) {
      console.error('Error saving match results:', error)
      throw new Error(`Failed to save results: ${error.message}`)
    }

    console.log(`Successfully saved ${matches.length} matches to database`)
  }

  async createPricelistFile() {
    console.log('Creating pricelist file from database...')
    
    // Fetch price items from Supabase - include id for proper mapping
    const { data: priceItems, error } = await this.supabase
      .from('price_items')
      .select('id, description, rate, full_context, unit')
      .not('rate', 'is', null)
      .not('description', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch price items: ${error.message}`)
    }

    if (!priceItems || priceItems.length === 0) {
      throw new Error('No price items found in database')
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pricelist')

    // Add headers - include id and unit for proper matching and mapping
    worksheet.addRow(['ID', 'Description', 'Rate', 'Unit'])

    // Add data - use full_context for AI matching but include all necessary data
    priceItems.forEach(item => {
      worksheet.addRow([
        item.id, // Include ID for proper mapping
        item.full_context || item.description, // Use full_context for AI matching
        item.rate,
        item.unit || ''
      ])
    })

    // Save to temp directory
    await workbook.xlsx.writeFile(this.pricelistPath)
    console.log(`Created pricelist with ${priceItems.length} items`)
  }

  async loadAndPreservedFormatting(filePath) {
    console.log('Loading and preserving original Excel formatting...')
    
    try {
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(filePath)

      // Store formatting information for each worksheet as an array
      const formattingInfo = []
      
      workbook.eachSheet((worksheet, sheetId) => {
        const sheetFormatting = {
          name: worksheet.name,
          columns: [],
          rows: [],
          properties: {
            defaultRowHeight: worksheet.properties.defaultRowHeight,
            defaultColWidth: worksheet.properties.defaultColWidth
          },
          pageSetup: worksheet.pageSetup
        }

        // Store column formatting
        if (worksheet.columns) {
          worksheet.columns.forEach((column, colIndex) => {
            if (column) {
              sheetFormatting.columns[colIndex] = {
                width: column.width,
                style: column.style
              }
            }
          })
        }

        // Store row formatting and cell styles
        worksheet.eachRow((row, rowNumber) => {
          const rowFormatting = {
            height: row.height,
            cells: []
          }

          try {
            row.eachCell((cell, colNumber) => {
              try {
                rowFormatting.cells[colNumber] = {
                  style: {
                    font: cell.font,
                    alignment: cell.alignment,
                    border: cell.border,
                    fill: cell.fill,
                    numFmt: cell.numFmt
                  }
                }
              } catch (cellError) {
                // Skip problematic cells
                console.warn(`⚠️ Could not preserve formatting for cell at row ${rowNumber}, col ${colNumber}: ${cellError.message}`)
              }
            })
          } catch (rowError) {
            console.warn(`⚠️ Could not iterate cells in row ${rowNumber}: ${rowError.message}`)
          }

          sheetFormatting.rows[rowNumber] = rowFormatting
        })

        formattingInfo[sheetId - 1] = sheetFormatting // Use zero-based index
      })

      console.log(`✅ Preserved formatting for ${formattingInfo.length} worksheets`)
      return formattingInfo
      
    } catch (error) {
      console.error(`❌ Error loading formatting: ${error.message}`)
      throw new Error(`Failed to load original formatting: ${error.message}`)
    }
  }

  async runPythonScript(inputPath, outputPath, jobId) {
    console.log('🐍 Running Python price matching script...')
    
    let apiKey = null
    
    // Try to get Cohere API key from admin settings first
    console.log('🔑 Fetching Cohere API key from admin settings...')
    
    try {
      const { data: settingsData, error: settingsError } = await this.supabase
        .from('app_settings')
        .select('cohere_api_key')
        .limit(1)
        .single()

      if (settingsError) {
        console.error('❌ Error fetching admin settings:', settingsError)
        throw new Error(`Admin settings error: ${settingsError.message}`)
      }

      if (settingsData?.cohere_api_key) {
        apiKey = settingsData.cohere_api_key
        console.log('✅ Successfully retrieved Cohere API key from admin settings')
      } else {
        throw new Error('No API key in admin settings')
      }

    } catch (adminError) {
      console.error('⚠️ Admin settings failed, trying .env fallback...')
      
      // Fallback to environment variable
      const envApiKey = process.env.COHERE_API_KEY
      console.error('🔍 Environment variables check:', {
        COHERE_API_KEY_exists: !!process.env.COHERE_API_KEY,
        COHERE_API_KEY_length: process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY.length : 'undefined',
        COHERE_API_KEY_value: process.env.COHERE_API_KEY ? `${process.env.COHERE_API_KEY.substring(0, 8)}...` : 'undefined'
      })
      
      if (envApiKey) {
        apiKey = envApiKey
        console.log('✅ Using Cohere API key from .env file as fallback')
      } else {
        console.error('❌ No Cohere API key found in admin settings OR .env file')
        await this.updateJobStatus(jobId, 'failed', 0, `
❌ Cohere API Key Missing!

import { ExcelParsingService } from './ExcelParsingService.js'
import { LocalPriceMatchingService } from './LocalPriceMatchingService.js'
import { CohereMatchingService } from './CohereMatchingService.js'
import { ExcelExportService } from './ExcelExportService.js'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'

export class PriceMatchingService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    )
    this.parsingService = new ExcelParsingService()
    this.localMatchingService = new LocalPriceMatchingService()
    this.cohereMatchingService = new CohereMatchingService(process.env.COHERE_API_KEY)
    this.exportService = new ExcelExportService()
    
    // Performance optimization: Cache price list
    this.priceListCache = null
    this.priceListCacheTime = null
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    
    // Batch processing configuration
    this.BATCH_SIZE = 100
    this.MAX_CONCURRENT_BATCHES = 3
  }

  async processFile(filePath, jobId, updateJobStatus, originalFileName) {
    try {
      console.log('🚀 Starting price matching process...')
      
      // Parse Excel file
      console.log('📋 Parsing Excel file...')
      const parsedData = await this.parsingService.parseExcelFile(filePath)
      
      // Get price list from database with caching
      console.log('💾 Loading price list from database...')
      const priceList = await this.getCachedPriceList()
      
      console.log(`✅ Found ${priceList.length} price items in database`)
      
      // Update job with parsed items count
      await updateJobStatus(jobId, 'processing', {
        progress: 20,
        extraData: {
          totalItems: parsedData.items.length,
          processedItems: 0,
          matchedItems: 0,
          confidence: 0
        }
      })
      
      // Pre-compute embeddings for AI matching (if API key exists)
      if (process.env.COHERE_API_KEY) {
        console.log('🤖 Pre-computing embeddings for AI matching...')
        await this.cohereMatchingService.precomputePriceListEmbeddings(priceList, jobId, this)
        await updateJobStatus(jobId, 'processing', { progress: 30 })
      }
      
      // Process items in parallel batches for better performance
      const results = await this.processItemsInBatches(
        parsedData.items, 
        priceList, 
        jobId, 
        updateJobStatus
      )
      
      // Save results to database
      console.log('💾 Saving match results to database...')
      await this.saveMatchResults(jobId, results)
      
      // Export results
      console.log('📊 Exporting results to Excel...')
      const outputFileName = await this.exportService.exportWithOriginalFormat(
        filePath,
        results,
        jobId,
        originalFileName
      )
      
      console.log('✅ Price matching completed successfully!')
      
      return {
        success: true,
        totalItems: parsedData.items.length,
        processedItems: results.length,
        matchedItems: results.filter(r => r.matched).length,
        confidence: this.calculateAverageConfidence(results),
        outputFileName
      }
      
    } catch (error) {
      console.error('❌ Error in price matching:', error)
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

  async processItemsInBatches(items, priceList, jobId, updateJobStatus) {
    const results = []
    const totalBatches = Math.ceil(items.length / this.BATCH_SIZE)
    
    console.log(`📦 Processing ${items.length} items in ${totalBatches} batches...`)
    
    // Process batches with concurrency limit
    for (let i = 0; i < totalBatches; i += this.MAX_CONCURRENT_BATCHES) {
      const batchPromises = []
      
      for (let j = 0; j < this.MAX_CONCURRENT_BATCHES && (i + j) < totalBatches; j++) {
        const batchIndex = i + j
        const start = batchIndex * this.BATCH_SIZE
        const end = Math.min(start + this.BATCH_SIZE, items.length)
        const batch = items.slice(start, end)
        
        batchPromises.push(this.processBatch(batch, priceList, jobId, batchIndex))
      }
      
      // Wait for current set of batches to complete
      const batchResults = await Promise.all(batchPromises)
      
      // Flatten results
      for (const batchResult of batchResults) {
        results.push(...batchResult)
      }
      
      // Update progress
      const progress = 30 + Math.round(((i + batchPromises.length) / totalBatches) * 60)
      await updateJobStatus(jobId, 'processing', {
        progress,
        extraData: {
          processedItems: results.length,
          matchedItems: results.filter(r => r.matched).length,
          confidence: this.calculateAverageConfidence(results)
        }
      })
    }
    
    return results
  }

  async processBatch(batch, priceList, jobId, batchIndex) {
    console.log(`🔄 Processing batch ${batchIndex + 1} (${batch.length} items)...`)
    
    // Run local and AI matching in parallel
    const [localResults, aiResults] = await Promise.all([
      this.localMatchingService.matchItems(batch, priceList, jobId, () => {}),
      process.env.COHERE_API_KEY 
        ? this.cohereMatchingService.matchItems(batch, priceList, jobId, () => {})
        : Promise.resolve([])
    ])
    
    // Combine results
    const combinedResults = this.combineMatchingResults(localResults, aiResults)
    
    return combinedResults
  }

  combineMatchingResults(localResults, aiResults) {
    // If no AI results, return local results
    if (!aiResults || aiResults.length === 0) {
      return localResults
    }

    // Combine results, preferring higher confidence matches
    return localResults.map((localResult, index) => {
      const aiResult = aiResults[index]
      
      if (!aiResult || !aiResult.matched) {
        return localResult
      }
      
      // Use AI result if it has higher confidence
      if (aiResult.confidence > localResult.confidence) {
        return {
          ...aiResult,
          matching_method: 'ai'
        }
      }
      
      return {
        ...localResult,
        matching_method: 'local'
      }
    })
  }

  async loadPriceList() {
    try {
      const allPriceItems = []
      let hasMore = true
      let offset = 0
      const limit = 1000
      
      while (hasMore) {
        const { data, error } = await this.supabase
          .from('price_items')
          .select('*')
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error loading price items:', error)
          throw error
        }
        
        if (data && data.length > 0) {
          allPriceItems.push(...data)
          offset += limit
          hasMore = data.length === limit
        } else {
          hasMore = false
        }
      }
      
      return allPriceItems
    } catch (error) {
      console.error('Error loading price list:', error)
      throw error
    }
  }

  async saveMatchResults(jobId, results) {
    if (!results || results.length === 0) return

    try {
      // Batch insert for better performance
      const batchSize = 500
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize).map(result => ({
          job_id: jobId,
          original_description: result.original_description,
          matched_description: result.matched_description,
          matched_rate: result.matched_rate,
          similarity_score: result.confidence,
          row_number: result.row_number,
          sheet_name: result.sheet_name,
          quantity: result.quantity,
          matched_price_item_id: result.matched_price_item_id,
          created_at: new Date().toISOString()
        }))

        const { error } = await this.supabase
          .from('match_results')
          .insert(batch)

        if (error) {
          console.error('Error saving batch:', error)
          throw error
        }
      }
      
      console.log(`✅ Saved ${results.length} match results`)
    } catch (error) {
      console.error('Error saving match results:', error)
      throw error
    }
  }

  calculateAverageConfidence(results) {
    if (!results || results.length === 0) return 0
    
    const matchedResults = results.filter(r => r.matched)
    if (matchedResults.length === 0) return 0
    
    const totalConfidence = matchedResults.reduce((sum, r) => sum + (r.confidence || 0), 0)
    return Math.round((totalConfidence / matchedResults.length) * 100)
  }

  updateJobStatus = async (jobId, status, updates = {}) => {
    try {
      const { error } = await this.supabase
        .from('ai_matching_jobs')
        .update({
          status,
          progress: updates.progress || 0,
          matched_items: updates.extraData?.matchedItems || 0,
          average_confidence: updates.extraData?.confidence || 0,
          updated_at: new Date().toISOString(),
          ...updates.extraData
        })
        .eq('id', jobId)

      if (error) {
        console.error('Error updating job status:', error)
      }
    } catch (error) {
      console.error('Error updating job status:', error)
    }
  }
}