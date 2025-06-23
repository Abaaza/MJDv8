import { CohereClient } from 'cohere-ai'
import path from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

export class CohereMatchingService {
  constructor() {
    // Don't initialize Cohere client here - we'll do it when we have the API key
    this.cohere = null
    this.embeddings = new Map()
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
    console.log(`⚡ Pre-computing embeddings for ${priceItems.length} price items...`);
    console.log(`[COHERE DEBUG] First 3 price items:`, priceItems.slice(0, 3).map(item => ({
      id: item.id,
      description: item.description?.substring(0, 50) + '...',
      rate: item.rate
    })));
    
    this.embeddings.clear();
    const startTime = Date.now();
    
    // Calculate total batches for progress tracking
    const totalBatches = Math.ceil(priceItems.length / this.EMBEDDING_BATCH_SIZE);
    
    // Process in batches
    for (let i = 0; i < priceItems.length; i += this.EMBEDDING_BATCH_SIZE) {
      const batch = priceItems.slice(i, i + this.EMBEDDING_BATCH_SIZE);
      const texts = batch.map(item => this.createSearchText(item));
      
      const currentBatch = Math.floor(i / this.EMBEDDING_BATCH_SIZE) + 1;
      console.log(`[COHERE DEBUG] Processing batch ${currentBatch}/${totalBatches}, texts sample:`, texts.slice(0, 2));
      
      try {
        const response = await this.cohere.embed({
          texts: texts,
          model: 'embed-english-v3.0',
          inputType: 'search_document',
          truncate: 'END',
          embeddingTypes: ['float'],
        });
        
        console.log(`[COHERE DEBUG] Got embeddings response, float length:`, response.embeddings?.float?.length);
        
        // Store embeddings
        batch.forEach((item, index) => {
          this.embeddings.set(item.id, {
            item: item,
            embedding: response.embeddings.float[index]
          });
        });
        
        // Update progress during embedding computation (45% to 50%)
        if (pmService && jobId) {
          const embeddingProgress = 45 + Math.round((currentBatch / totalBatches) * 5); // Progress from 45% to 50%
          await pmService.updateJobStatus(
            jobId, 
            'processing', 
            embeddingProgress, 
            `Analyzing price database... (${Math.min(i + batch.length, priceItems.length)}/${priceItems.length} items)`,
            {
              total_items: pmService.currentTotalItems || 0,
              matched_items: 0
            }
          );
        }
        
        const progress = Math.min(100, Math.round((i + batch.length) / priceItems.length * 100));
        console.log(`   ⚡ Progress: ${progress}% (${i + batch.length}/${priceItems.length})`);
      } catch (error) {
        console.error('[COHERE DEBUG] Error computing embeddings batch:', error);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Pre-computed ${this.embeddings.size} embeddings in ${duration}s`);
    console.log(`[COHERE DEBUG] Final embeddings map size: ${this.embeddings.size}`);
  }

  /**
   * Match items using Cohere Embeddings for ultra-fast matching
   */
  async matchItems(items, priceList, jobId, originalFileName) {
    try {
      // Initialize Cohere client with API key
      await this.initializeCohere()
      
      console.log(`🚀 Starting Ultra-Fast Cohere Embedding Matching`)
      console.log(`   - Items to match: ${items.length}`)
      console.log(`   - Price list items: ${priceList.length}`)
      
      // Import PriceMatchingService for progress updates and cancellation checker
      const { PriceMatchingService } = await import('./PriceMatchingService.js')
      const { isJobCancelled } = await import('../routes/priceMatching.js')
      const pmService = new PriceMatchingService()
      
      // Store total items for progress tracking
      pmService.currentTotalItems = items.length
      
      // Pre-compute price list embeddings
      await this.precomputePriceListEmbeddings(priceList, jobId, pmService)
      await pmService.updateJobStatus(jobId, 'processing', 45, `Analyzing price database...`);
      
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
          await pmService.updateJobStatus(jobId, 'stopped', 0, 'Job stopped by user')
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
            const queryEmbedding = response.embeddings.float[index];
            const bestMatch = this.findBestEmbeddingMatch(queryEmbedding, boqItem);
            
            console.log(`[COHERE DEBUG] Item ${i + index + 1}: bestMatch =`, bestMatch ? { confidence: bestMatch.confidence, hasItem: !!bestMatch.item } : 'null');
            
            if (bestMatch && bestMatch.item) {
              const matchResult = {
                id: boqItem.id,
                original_description: boqItem.description,
                quantity: boqItem.quantity,
                unit: boqItem.unit || '',
                matched_description: bestMatch.item.description || bestMatch.item.full_context,
                matched_rate: bestMatch.item.rate,
                matched_unit: bestMatch.item.unit || '',
                total_amount: boqItem.quantity * bestMatch.item.rate,
                matched_price_item_id: bestMatch.item.id,
                match_method: 'cohere_embedding',
                confidence: bestMatch.confidence / 100, // Convert to 0-1 scale
                reasoning: bestMatch.reason,
                row_number: boqItem.row_number,
                sheet_name: boqItem.sheet_name,
                similarity_score: bestMatch.confidence,
                section_header: boqItem.section_header || null
              };
              
              matches.push(matchResult);
              matchedCount++;
              totalConfidence += bestMatch.confidence;
              
              console.log(`[COHERE DEBUG] MATCHED! Count now: ${matchedCount}, Total confidence: ${totalConfidence}`);
              
              if (bestMatch.confidence >= 50) {
                console.log(`✅ Match (${bestMatch.confidence}%): "${boqItem.description.substring(0, 30)}..."`)
              } else {
                console.log(`⚠️  Low confidence (${bestMatch.confidence}%): "${boqItem.description.substring(0, 30)}..."`)
              }
            } else {
              console.log(`[COHERE DEBUG] NO MATCH for item ${i + index + 1} - adding empty result`);
              // Still add a result with no match
              matches.push({
                id: boqItem.id,
                original_description: boqItem.description,
                quantity: boqItem.quantity,
                unit: boqItem.unit || '',
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
          // Progress from 50% to 80% during matching
          const matchingProgress = 50 + Math.round((currentBatch / totalBatches) * 30)
          await pmService.updateJobStatus(
            jobId, 
            'processing', 
            matchingProgress, 
            `Matching ${Math.min(i + batch.length, items.length)}/${items.length} items (${matchedCount} matches found)`,
            {
              total_items: items.length,
              matched_items: matchedCount
            }
          )
          
        } catch (error) {
          console.error('Error in embedding batch:', error);
          // Add empty matches for failed batch
          batch.forEach(boqItem => {
            matches.push({
              id: boqItem.id,
              original_description: boqItem.description,
              quantity: boqItem.quantity,
              unit: boqItem.unit || '',
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
      const outputPath = await this.generateOutputExcel(matches, jobId, originalFileName)
      
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
   * Find best match using cosine similarity
   */
  findBestEmbeddingMatch(queryEmbedding, boqItem) {
    let bestMatch = null;
    let bestScore = -1;
    let bestItem = null;
    
    // Calculate cosine similarity with all price items
    for (const [priceItemId, data] of this.embeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
      
      if (similarity > bestScore) {
        bestScore = similarity;
        bestItem = data.item;
      }
    }
    
    console.log(`[COHERE DEBUG findBestEmbeddingMatch] Best score: ${bestScore}, Has best item: ${!!bestItem}`);
    
    if (!bestItem) {
      // If no embeddings exist or something went wrong, return first price item with 1% confidence
      if (this.embeddings.size > 0) {
        const firstEntry = this.embeddings.entries().next().value;
        if (firstEntry) {
          console.log(`[COHERE DEBUG] Using fallback match`);
          return {
            item: firstEntry[1].item,
            confidence: 1,
            reason: 'Fallback match - no suitable embedding found'
          };
        }
      }
      console.log(`[COHERE DEBUG] No embeddings available, returning null`);
      return null;
    }
    
    // Convert similarity to confidence percentage
    let confidence = Math.round(bestScore * 100);
    
    // Additional checks for unit matching
    let unitBonus = 0;
    if (boqItem.unit && bestItem.unit) {
      const boqUnit = boqItem.unit.toLowerCase().trim();
      const priceUnit = bestItem.unit.toLowerCase().trim();
      
      if (boqUnit === priceUnit) {
        unitBonus = 10;
      } else if (this.areUnitsCompatible(boqUnit, priceUnit)) {
        unitBonus = 5;
      }
    }
    
    confidence = Math.min(confidence + unitBonus, 100);
    
    // Always return the best match, even with very low confidence
    // If confidence is 0, boost it to at least 1%
    if (confidence === 0) {
      console.log(`[COHERE DEBUG] Boosting 0% confidence to 1%`);
      confidence = 1;
    }
    
    console.log(`[COHERE DEBUG] Returning match with confidence: ${confidence}%`);
    
    return {
      item: bestItem,
      confidence: confidence,
      reason: `Semantic similarity: ${Math.round(bestScore * 100)}%${unitBonus > 0 ? `, Unit match: +${unitBonus}%` : ''}`
    };
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
  async generateOutputExcel(matches, jobId, originalFileName) {
    try {
      // Import ExcelExportService
      const { ExcelExportService } = await import('./ExcelExportService.js')
      const exportService = new ExcelExportService()
      
      // Get the original input file path from the job
      const { data: jobData } = await this.supabase
        .from('ai_matching_jobs')
        .select('original_file_path, input_file_blob_key')
        .eq('id', jobId)
        .single()
      
      let originalFilePath = null
      
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