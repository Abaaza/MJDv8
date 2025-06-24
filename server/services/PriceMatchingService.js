import { ExcelParsingService } from './ExcelParsingService.js'
import { LocalPriceMatchingService } from './LocalPriceMatchingService.js'
import { CohereMatchingService } from './CohereMatchingService.js'
import { ExcelExportService } from './ExcelExportService.js'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs-extra'

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
      // Build update object with only existing columns
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }

      // Add progress if provided
      if (updates.progress !== undefined) {
        updateData.progress = updates.progress
      }

      // Add extraData fields if they exist in the schema
      if (updates.extraData) {
        // Only add fields that exist in the database schema
        if (updates.extraData.matchedItems !== undefined) {
          updateData.matched_items = updates.extraData.matchedItems
        }
        if (updates.extraData.totalItems !== undefined) {
          updateData.total_items = updates.extraData.totalItems
        }
        if (updates.extraData.confidence !== undefined) {
          // Try to update average_confidence, but don't fail if it doesn't exist
          updateData.confidence_score = updates.extraData.confidence
        }
      }

      const { error } = await this.supabase
        .from('ai_matching_jobs')
        .update(updateData)
        .eq('id', jobId)

      if (error) {
        console.error('Error updating job status:', error)
        
        // If the error is about missing columns, try with basic update only
        if (error.message.includes('column') && error.message.includes('schema cache')) {
          console.log('Retrying with basic update only...')
          const basicUpdate = {
            status,
            updated_at: new Date().toISOString()
          }
          
          const { error: retryError } = await this.supabase
            .from('ai_matching_jobs')
            .update(basicUpdate)
            .eq('id', jobId)
            
          if (retryError) {
            console.error('Basic update also failed:', retryError)
          }
        }
      }
    } catch (error) {
      console.error('Error updating job status:', error)
    }
  }

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