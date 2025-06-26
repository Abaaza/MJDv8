import { CohereClient } from 'cohere-ai'
import path from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

export class CohereMatchingService {
  constructor() {
    // Don't initialize Cohere client here - we'll do it when we have the API key
    this.cohere = null
    this.embeddings = new Map()
    this.embeddingsByCategory = new Map()
    this.EMBEDDING_BATCH_SIZE = 96
    
    // Initialize Supabase for fetching API key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    if (!supabaseKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in environment')
    }
    
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      supabaseKey
    )
  }

  /**
   * Initialize Cohere client with API key
   */
  async initializeCohere() {
    if (this.cohere) {
      return // Already initialized
    }

    // Try to get API key from database first
    let apiKey = null
    
    try {
      console.log('🔑 Fetching Cohere API key from admin settings...')
      
      const { data: settingsData, error: settingsError } = await this.supabase
        .from('app_settings')
        .select('cohere_api_key')
        .limit(1)
        .single()

      if (settingsError) {
        console.error('❌ Error fetching admin settings:', settingsError)
      } else if (settingsData?.cohere_api_key) {
        apiKey = settingsData.cohere_api_key
        console.log('✅ Successfully retrieved Cohere API key from admin settings')
      }
    } catch (error) {
      console.error('⚠️ Failed to fetch API key from database:', error)
    }

    // Fallback to environment variable
    if (!apiKey) {
      apiKey = process.env.COHERE_API_KEY
      if (apiKey) {
        console.log('✅ Using Cohere API key from environment variable as fallback')
      }
    }

    if (!apiKey) {
      throw new Error('No Cohere API key found in database or environment variables. Please add it to Admin Settings.')
    }

    // Initialize Cohere client
    this.cohere = new CohereClient({
      token: apiKey
    })
  }

  /**
   * Identify category from various sources
   */
  identifyCategory(item, sheetName) {
    const categoryKeywords = {
      'excavation': ['excavation', 'earthwork', 'digging', 'cut', 'fill', 'soil', 'ground'],
      'concrete': ['concrete', 'rcc', 'pcc', 'cement', 'mortar', 'plaster'],
      'steel': ['steel', 'rebar', 'reinforcement', 'tor', 'tmt', 'bar', 'metal'],
      'masonry': ['brick', 'block', 'masonry', 'wall', 'partition'],
      'finishing': ['paint', 'painting', 'tile', 'tiles', 'flooring', 'ceiling', 'plaster'],
      'doors_windows': ['door', 'window', 'shutter', 'frame', 'glazing'],
      'plumbing': ['pipe', 'plumbing', 'water', 'sanitary', 'drainage', 'sewage'],
      'electrical': ['wire', 'cable', 'electrical', 'switch', 'socket', 'light'],
      'roofing': ['roof', 'waterproof', 'insulation', 'sheet', 'covering'],
      'formwork': ['formwork', 'shuttering', 'centering', 'staging'],
      'structural': ['beam', 'column', 'slab', 'foundation', 'footing', 'structural']
    }
    
    let identifiedCategory = null
    let confidenceScore = 0
    
    // 1. Check section headers (highest priority)
    if (item.section_header) {
      const headerLower = item.section_header.toLowerCase()
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => headerLower.includes(keyword))) {
          identifiedCategory = category
          confidenceScore = 0.9
          console.log(`📂 [COHERE] Category from header: ${category} (${item.section_header})`)
          break
        }
      }
    }
    
    // 2. Check sheet name (medium priority)
    if (!identifiedCategory && sheetName) {
      const sheetLower = sheetName.toLowerCase()
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => sheetLower.includes(keyword))) {
          identifiedCategory = category
          confidenceScore = 0.7
          console.log(`📂 [COHERE] Category from sheet: ${category} (${sheetName})`)
          break
        }
      }
    }
    
    // 3. Check item description (lower priority)
    if (!identifiedCategory && item.description) {
      const descLower = item.description.toLowerCase()
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const matchCount = keywords.filter(keyword => descLower.includes(keyword)).length
        if (matchCount > 0) {
          const score = matchCount / keywords.length
          if (score > confidenceScore) {
            identifiedCategory = category
            confidenceScore = 0.5 + (score * 0.3)
            console.log(`📂 [COHERE] Category from description: ${category} (score: ${confidenceScore})`)
          }
        }
      }
    }
    
    return { category: identifiedCategory, confidence: confidenceScore }
  }

  /**
   * Create search text for embeddings
   */
  createSearchText(item) {
    const parts = [
      item.item_number || '',
      item.description || item.full_context || '',
      item.unit || '',
      item.rate ? `${item.rate} rate` : '',
      item.category || '',
      item.subcategory || ''
    ].filter(part => part);
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Precompute embeddings for price list items
   */
  async precomputePriceListEmbeddings(priceItems, jobId, pmService) {
    try {
      console.log(`⚡ [COHERE] Pre-computing embeddings for ${priceItems.length} price items...`);
      console.log(`[COHERE DEBUG] First 3 price items:`, priceItems.slice(0, 3).map(item => ({
        id: item.id,
        description: item.description?.substring(0, 50) + '...',
        rate: item.rate,
        category: item.category
      })));
      
      // Initialize Cohere client first
      await this.initializeCohere();
      console.log(`✅ [COHERE] Client initialized successfully`);
      
      this.embeddings.clear();
      this.embeddingsByCategory = new Map(); // Store embeddings by category
      const startTime = Date.now();
      
      // Calculate total batches for progress tracking
      const totalBatches = Math.ceil(priceItems.length / this.EMBEDDING_BATCH_SIZE);
      console.log(`📊 [COHERE] Will process ${totalBatches} batches of ${this.EMBEDDING_BATCH_SIZE} items each`);
      
      // pmService is always the wrapper for progress tracking - we'll work with it correctly
    
          // Import cancellation checker
      const { isJobCancelled } = await import('../routes/priceMatching.js')
      
      // Process in batches
      for (let i = 0; i < priceItems.length; i += this.EMBEDDING_BATCH_SIZE) {
        // Check if job was cancelled before processing each batch
        if (isJobCancelled(jobId)) {
          console.log(`🛑 [COHERE] Job ${jobId} was cancelled during embedding batch processing`);
          throw new Error('Job was cancelled by user');
        }
        
        const batch = priceItems.slice(i, i + this.EMBEDDING_BATCH_SIZE);
        const texts = batch.map(item => this.createSearchText(item));
        
        const currentBatch = Math.floor(i / this.EMBEDDING_BATCH_SIZE) + 1;
        console.log(`🔄 [COHERE] Processing embedding batch ${currentBatch}/${totalBatches} (${batch.length} items)`);
      
      try {
        const response = await this.cohere.embed({
          texts: texts,
          model: 'embed-english-v3.0',
          inputType: 'search_document',
          truncate: 'END',
          embeddingTypes: ['float'],
        });
        
        console.log(`✅ [COHERE] Got embeddings for batch ${currentBatch}, storing...`);
        
        // Store embeddings
        batch.forEach((item, index) => {
          const embeddingData = {
            item: item,
            embedding: response.embeddings.float[index]
          };
          
          // Store in main map
          this.embeddings.set(item.id, embeddingData);
          
          // Also store by category if available
          if (item.category) {
            const categoryKey = item.category.toLowerCase();
            if (!this.embeddingsByCategory.has(categoryKey)) {
              this.embeddingsByCategory.set(categoryKey, new Map());
            }
            this.embeddingsByCategory.get(categoryKey).set(item.id, embeddingData);
          }
        });
        
        // Update progress during embedding computation
        if (pmService && pmService.updateJobStatus && jobId) {
          // Use the progress wrapper correctly - pass individual batch progress
          const batchProgress = Math.round((currentBatch / totalBatches) * 100);
          console.log(`🔄 [COHERE] Updating progress: batch ${currentBatch}/${totalBatches} = ${batchProgress}% of embedding phase`);
          
          // Call the wrapper with correct parameter order: (jobId, status, serviceProgress, message, extraData)
          const embeddingUpdateResult = await pmService.updateJobStatus(
            jobId, 
            'processing', 
            batchProgress, 
            `Cohere: Computing embeddings batch ${currentBatch}/${totalBatches} (${Math.min(i + batch.length, priceItems.length)}/${priceItems.length} items)`
          );
          
          if (!embeddingUpdateResult) {
            console.error(`❌ [COHERE EMBEDDING] Failed to update progress for batch ${currentBatch}/${totalBatches}`)
          } else {
            console.log(`✅ [COHERE EMBEDDING] Progress update successful: ${batchProgress}%`)
          }
        }
        
        console.log(`📊 [COHERE] Progress: ${Math.round((currentBatch / totalBatches) * 100)}% (${i + batch.length}/${priceItems.length} items)`);
        
        // Longer delay to ensure frontend sees the progress update
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`❌ [COHERE] Error computing embeddings batch ${currentBatch}:`, error);
        
        // Update progress even on error to prevent hanging
        if (pmService && pmService.updateJobStatus && jobId) {
          const batchProgress = Math.round((currentBatch / totalBatches) * 100);
          console.log(`🔄 [COHERE] Updating progress on error: batch ${currentBatch}/${totalBatches} = ${batchProgress}% of embedding phase`);
          await pmService.updateJobStatus(
            jobId, 
            'processing', 
            batchProgress, 
            `Error in batch ${currentBatch}/${totalBatches}, continuing...`
          );
        }
      }
    }
    
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ [COHERE] Pre-computed ${this.embeddings.size} embeddings in ${duration}s`);
      console.log(`📊 [COHERE] Final stats: ${this.embeddings.size} embeddings, ${this.embeddingsByCategory.size} categories`);
      
      if (this.embeddings.size === 0) {
        throw new Error('No embeddings were computed - all batches may have failed');
      }
      
    } catch (error) {
      console.error(`❌ [COHERE] Failed to precompute embeddings:`, error);
      console.error(`❌ [COHERE] Error stack:`, error.stack);
      throw error; // Re-throw to ensure the hybrid matching knows it failed
    }
  }

  /**
   * Match items using Cohere Embeddings for ultra-fast matching
   */
  async matchItems(items, priceList, jobId, updateJobStatus) {
    try {
      // Initialize Cohere client with API key
      await this.initializeCohere()
      
      console.log(`🚀 Starting Ultra-Fast Cohere Embedding Matching`)
      console.log(`   - Items to match: ${items.length}`)
      console.log(`   - Price list items: ${priceList.length}`)
      
      // Import cancellation checker  
      const { isJobCancelled } = await import('../routes/priceMatching.js')
      
      // Pre-compute price list embeddings
      await this.precomputePriceListEmbeddings(priceList, jobId, { updateJobStatus })
      
      const matches = []
      let matchedCount = 0
      let totalConfidence = 0
      const startTime = Date.now();
      
      // Process BOQ items in large batches
      const totalBatches = Math.ceil(items.length / this.EMBEDDING_BATCH_SIZE)
      
      for (let i = 0; i < items.length; i += this.EMBEDDING_BATCH_SIZE) {
        // Check if job was cancelled before processing each batch
        if (isJobCancelled(jobId)) {
          console.log(`🛑 Job ${jobId} was cancelled during matching, stopping batch processing`)
          await updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
          return { outputPath: null, totalMatched: 0, averageConfidence: 0, matches: [] }
        }
        
        const batch = items.slice(i, i + this.EMBEDDING_BATCH_SIZE)
        const currentBatch = Math.floor(i/this.EMBEDDING_BATCH_SIZE) + 1
        
        console.log(`   🚀 Processing batch ${currentBatch}/${totalBatches} (${batch.length} items)`)
        
        // Create query texts
        const queries = batch.map(item => this.createQueryText(item));
        
        try {
          // Get query embeddings
          const response = await this.cohere.embed({
            texts: queries,
            model: 'embed-english-v3.0',
            inputType: 'search_query',
            truncate: 'END',
            embeddingTypes: ['float'],
          });
          
          // Find best matches for each query
          batch.forEach((boqItem, index) => {
            // Identify category for this item
            const categoryInfo = this.identifyCategory(boqItem, boqItem.sheet_name);
            console.log(`📂 [COHERE] Item ${i + index + 1}: Category = ${categoryInfo.category || 'none'} (confidence: ${categoryInfo.confidence})`);
            
            const queryEmbedding = response.embeddings.float[index];
            const bestMatch = this.findBestEmbeddingMatch(queryEmbedding, boqItem);
            
            console.log(`[COHERE DEBUG] Item ${i + index + 1}: bestMatch =`, bestMatch ? { confidence: bestMatch.confidence, hasItem: !!bestMatch.item } : 'null');
            
            if (bestMatch && bestMatch.item) {
              const matchResult = {
                id: boqItem.id,
                original_description: boqItem.description,
                description: boqItem.description,
                quantity: boqItem.quantity,
                unit: boqItem.unit || '',
                matched: true,
                matched_description: bestMatch.item.description || bestMatch.item.full_context,
                matched_rate: bestMatch.item.rate,
                matched_unit: bestMatch.item.unit || '',
                total_amount: boqItem.quantity * bestMatch.item.rate,
                matched_price_item_id: bestMatch.item.id,
                match_method: 'cohere_embedding',
                confidence: bestMatch.similarity || (bestMatch.confidence / 100),
                reasoning: bestMatch.reason,
                row_number: boqItem.row_number,
                sheet_name: boqItem.sheet_name,
                similarity_score: bestMatch.similarity || (bestMatch.confidence / 100),
                section_header: boqItem.section_header || null
              };
              
              matches.push(matchResult);
              matchedCount++;
              totalConfidence += (bestMatch.similarity || (bestMatch.confidence / 100)) * 100;
              
              console.log(`[COHERE DEBUG] MATCHED! Count now: ${matchedCount}, Total confidence: ${totalConfidence}`);
              
              const confidencePercent = (bestMatch.similarity || (bestMatch.confidence / 100)) * 100;
              if (confidencePercent >= 50) {
                console.log(`✅ Match (${confidencePercent.toFixed(0)}%): "${boqItem.description.substring(0, 30)}..."`)
              } else {
                console.log(`⚠️  Low confidence (${confidencePercent.toFixed(0)}%): "${boqItem.description.substring(0, 30)}..."`)
              }
            } else {
              console.log(`[COHERE DEBUG] NO MATCH for item ${i + index + 1} - adding empty result`);
              // Still add a result with no match
              matches.push({
                id: boqItem.id,
                original_description: boqItem.description,
                description: boqItem.description,
                quantity: boqItem.quantity,
                unit: boqItem.unit || '',
                matched: false,
                matched_description: '',
                matched_rate: 0,
                matched_unit: '',
                total_amount: 0,
                matched_price_item_id: null,
                match_method: 'cohere_embedding',
                confidence: 0,
                reasoning: 'No suitable match found',
                row_number: boqItem.row_number,
                sheet_name: boqItem.sheet_name,
                similarity_score: 0,
                section_header: boqItem.section_header || null
              });
            }
          });
          
          // Update progress AFTER processing the batch
          const matchingProgress = Math.round((currentBatch / totalBatches) * 100)
          
          const updateResult = await updateJobStatus(
            jobId, 
            'processing', 
            matchingProgress, 
            `Cohere: Matching ${Math.min(i + batch.length, items.length)}/${items.length} items (${matchedCount} matches found)`,
            {
              total_items: items.length,
              matched_items: matchedCount
            }
          )
          
          // Log if the database update failed
          if (!updateResult) {
            console.error(`❌ [COHERE MATCH] Failed to update progress for batch ${currentBatch}/${totalBatches}`)
          } else {
            console.log(`✅ [COHERE MATCH] Progress updated: ${matchingProgress}% (${matchedCount} matches)`)
          }
          
          // Add a small delay to ensure frontend polling can catch this update
          await new Promise(resolve => setTimeout(resolve, 150))
          
        } catch (error) {
          console.error('Error in embedding batch:', error);
          // Add empty matches for failed batch
          batch.forEach(boqItem => {
            matches.push({
              id: boqItem.id,
              original_description: boqItem.description,
              description: boqItem.description,
              quantity: boqItem.quantity,
              unit: boqItem.unit || '',
              matched: false,
              matched_description: '',
              matched_rate: 0,
              matched_unit: '',
              total_amount: 0,
              matched_price_item_id: null,
              match_method: 'cohere_embedding',
              confidence: 0,
              reasoning: 'Embedding error',
              row_number: boqItem.row_number,
              sheet_name: boqItem.sheet_name,
              similarity_score: 0,
              section_header: boqItem.section_header || null
            });
          });
        }
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const avgConfidence = matchedCount > 0 ? Math.round(totalConfidence / matchedCount) : 0
      
      console.log(`[COHERE DEBUG] FINAL SUMMARY:`);
      console.log(`[COHERE DEBUG] - Total items: ${items.length}`);
      console.log(`[COHERE DEBUG] - Matched count: ${matchedCount}`);
      console.log(`[COHERE DEBUG] - Total confidence sum: ${totalConfidence}`);
      console.log(`[COHERE DEBUG] - Average confidence: ${avgConfidence}%`);
      console.log(`[COHERE DEBUG] - Matches array length: ${matches.length}`);
      
      console.log(`🚀 Ultra-Fast Cohere Embedding Summary:`)
      console.log(`   - Items processed: ${items.length}`)
      console.log(`   - Matches found: ${matchedCount}`)
      console.log(`   - Average confidence: ${avgConfidence}%`)
      console.log(`   - Success rate: ${Math.round((matchedCount / items.length) * 100)}%`)
      console.log(`   - Total time: ${duration}s (${(items.length / duration).toFixed(1)} items/sec)`)
      
      // Generate output Excel file
      const outputPath = await this.generateOutputExcel(matches, jobId)
      
      const result = {
        outputPath,
        totalMatched: matchedCount,
        averageConfidence: avgConfidence,
        matches
      }
      
      console.log(`[COHERE DEBUG] Returning result:`, { 
        outputPath: result.outputPath,
        totalMatched: result.totalMatched,
        averageConfidence: result.averageConfidence,
        matchesLength: result.matches.length 
      });
      
      return result
      
    } catch (error) {
      console.error(`❌ Error in Cohere embedding matching:`, error)
      throw error
    }
  }

  /**
   * Create query text from BOQ item
   */
  createQueryText(boqItem) {
    // Use enhanced description if available, otherwise regular description
    const description = boqItem.enhanced_description || boqItem.description || ''
    
    const parts = [
      description,
      boqItem.unit || '',
      boqItem.section || '',
      boqItem.section_header || ''  // Include section headers for better context
    ].filter(part => part);
    
    const queryText = parts.join(' ').toLowerCase();
    
    // Log if we're using enhanced description
    if (boqItem.enhanced_description) {
      console.log(`[COHERE] Using enhanced description: "${boqItem.enhanced_description.substring(0, 60)}..."`)
    }
    
    return queryText;
  }

  /**
   * Find best matching price item using embeddings
   */
  findBestEmbeddingMatch(queryEmbedding, boqItem) {
    let bestMatch = null
    let bestSimilarity = -1
    
    // Check if item has a category
    const categoryInfo = this.identifyCategory(boqItem)
    
    // First try to match within category if identified
    if (categoryInfo.category && this.embeddingsByCategory.has(categoryInfo.category.toLowerCase())) {
      const categoryEmbeddings = this.embeddingsByCategory.get(categoryInfo.category.toLowerCase())
      
      for (const [itemId, embeddingData] of categoryEmbeddings) {
        const similarity = this.cosineSimilarity(queryEmbedding, embeddingData.embedding)
        
        if (similarity > bestSimilarity && similarity > 0.5) { // Lower threshold for category matches
          bestSimilarity = similarity
          bestMatch = embeddingData.item
        }
      }
    }
    
    // If no good category match, search all items
    if (!bestMatch || bestSimilarity < 0.6) {
      for (const [itemId, embeddingData] of this.embeddings) {
        const similarity = this.cosineSimilarity(queryEmbedding, embeddingData.embedding)
        
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity
          bestMatch = embeddingData.item
        }
      }
    }
    
    // Always return the best match found, even if confidence is low
    // Minimum 1% confidence to ensure we always have a result
    if (bestMatch) {
      return {
        item: bestMatch,
        similarity: Math.max(0.01, bestSimilarity),
        confidence: Math.max(1, Math.round(bestSimilarity * 100)),
        reason: `Embedding similarity: ${Math.round(bestSimilarity * 100)}%`
      }
    }
    
    // If absolutely no match found (which should be rare), return the first item with minimal confidence
    if (this.embeddings.size > 0) {
      const firstItem = this.embeddings.values().next().value
      return {
        item: firstItem.item,
        similarity: 0.01,
        confidence: 1,
        reason: 'Fallback match'
      }
    }
    
    return null
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Check if units are compatible
   */
  areUnitsCompatible(unit1, unit2) {
    const unitMap = {
      'm': ['meter', 'meters', 'metre', 'metres', 'mtr', 'mtrs', 'lm'],
      'm2': ['sqm', 'sq.m', 'sq m', 'square meter', 'square meters', 'm²'],
      'm3': ['cum', 'cu.m', 'cu m', 'cubic meter', 'cubic meters', 'm³'],
      'kg': ['kilogram', 'kilograms', 'kgs'],
      'no': ['nos', 'number', 'numbers', 'pcs', 'pieces', 'each', 'ea', 'item'],
      'ton': ['tons', 'tonne', 'tonnes', 'mt'],
      'ls': ['lump sum', 'lumpsum', 'lot', 'job'],
      'hr': ['hour', 'hours', 'hrs'],
      'day': ['days'],
      'month': ['months', 'mon'],
      'week': ['weeks', 'wk']
    };
    
    // Check if both units belong to the same group
    for (const [standard, variations] of Object.entries(unitMap)) {
      const group = [standard, ...variations];
      if (group.some(u => unit1.includes(u)) && group.some(u => unit2.includes(u))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate output Excel file
   */
  async generateOutputExcel(matches, jobId) {
    try {
      // Import ExcelExportService
      const { ExcelExportService } = await import('./ExcelExportService.js')
      const exportService = new ExcelExportService()
      
      // Get the original input file path from the job
      const { data: jobData } = await this.supabase
        .from('ai_matching_jobs')
        .select('original_file_path, input_file_blob_key, project_name')
        .eq('id', jobId)
        .single()
      
      let originalFilePath = null
      let originalFileName = 'output.xlsx'
      
      // Extract filename from original path or use project name
      if (jobData?.original_file_path) {
        const pathParts = jobData.original_file_path.split(/[/\\]/)
        originalFileName = pathParts[pathParts.length - 1] || `${jobData.project_name || 'output'}.xlsx`
      } else if (jobData?.project_name) {
        originalFileName = `${jobData.project_name}.xlsx`
      }
      
      // Try to get the original file
      if (jobData?.original_file_path && fs.existsSync(jobData.original_file_path)) {
        originalFilePath = jobData.original_file_path
        console.log(`✅ Found original file at: ${originalFilePath}`)
      } else if (jobData?.input_file_blob_key) {
        // Try to download from blob storage
        try {
          const VercelBlobService = (await import('./VercelBlobService.js')).default
          const blobData = await VercelBlobService.downloadFile(jobData.input_file_blob_key)
          
          // Save to temp directory
          const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'temp')
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
          }
          
          originalFilePath = path.join(tempDir, `original-${jobId}-${originalFileName}`)
          await fs.promises.writeFile(originalFilePath, blobData.Body)
          console.log(`✅ Downloaded original file from blob to: ${originalFilePath}`)
        } catch (blobError) {
          console.error('Failed to download from blob:', blobError)
        }
      }
      
      // Use ExcelExportService with original format if available
      if (originalFilePath && fs.existsSync(originalFilePath)) {
        console.log(`📄 Using ExcelExportService with original format preservation`)
        const outputPath = await exportService.exportWithOriginalFormat(
          originalFilePath,
          matches,
          jobId,
          originalFileName
        )
        return outputPath
      } else {
        console.log(`📄 Using basic Excel export (original file not available)`)
        const outputPath = await exportService.exportToExcel(
          matches,
          jobId,
          originalFileName
        )
        return outputPath
      }
    } catch (error) {
      console.error('Error generating output Excel:', error)
      throw error
    }
  }
} 