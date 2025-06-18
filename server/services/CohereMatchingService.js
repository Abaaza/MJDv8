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
  async precomputePriceListEmbeddings(priceItems) {
    console.log(`⚡ Pre-computing embeddings for ${priceItems.length} price items...`);
    
    this.embeddings.clear();
    const startTime = Date.now();
    
    // Process in batches
    for (let i = 0; i < priceItems.length; i += this.EMBEDDING_BATCH_SIZE) {
      const batch = priceItems.slice(i, i + this.EMBEDDING_BATCH_SIZE);
      const texts = batch.map(item => this.createSearchText(item));
      
      try {
        const response = await this.cohere.embed({
          texts: texts,
          model: 'embed-english-v3.0',
          inputType: 'search_document',
          truncate: 'END',
          embeddingTypes: ['float'],
        });
        
        // Store embeddings
        batch.forEach((item, index) => {
          this.embeddings.set(item.id, {
            item: item,
            embedding: response.embeddings.float[index]
          });
        });
        
        const progress = Math.min(100, Math.round((i + batch.length) / priceItems.length * 100));
        console.log(`   ⚡ Progress: ${progress}% (${i + batch.length}/${priceItems.length})`);
      } catch (error) {
        console.error('Error computing embeddings batch:', error);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Pre-computed ${this.embeddings.size} embeddings in ${duration}s`);
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
      
      // Import PriceMatchingService for progress updates
      const { PriceMatchingService } = await import('./PriceMatchingService.js')
      const pmService = new PriceMatchingService()
      
      // Pre-compute price list embeddings
      await this.precomputePriceListEmbeddings(priceList);
      await pmService.updateJobStatus(jobId, 'processing', 45, `Analyzing price database...`);
      
      const matches = []
      let matchedCount = 0
      let totalConfidence = 0
      const startTime = Date.now();
      
      // Process BOQ items in large batches
      const totalBatches = Math.ceil(items.length / this.EMBEDDING_BATCH_SIZE)
      
      for (let i = 0; i < items.length; i += this.EMBEDDING_BATCH_SIZE) {
        const batch = items.slice(i, i + this.EMBEDDING_BATCH_SIZE)
        const currentBatch = Math.floor(i/this.EMBEDDING_BATCH_SIZE) + 1
        
        console.log(`   🚀 Processing batch ${currentBatch}/${totalBatches} (${batch.length} items)`)
        
        // Update progress (45-80% range for matching phase)
        const matchingProgress = 45 + Math.round((currentBatch / totalBatches) * 35)
        await pmService.updateJobStatus(
          jobId, 
          'processing', 
          matchingProgress, 
          `Ultra-fast matching: ${i + batch.length}/${items.length} items`
        )
        
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
              
              if (bestMatch.confidence >= 50) {
                console.log(`✅ Match (${bestMatch.confidence}%): "${boqItem.description.substring(0, 30)}..."`)
              } else {
                console.log(`⚠️  Low confidence (${bestMatch.confidence}%): "${boqItem.description.substring(0, 30)}..."`)
              }
            } else {
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
      
      console.log(`🚀 Ultra-Fast Cohere Embedding Summary:`)
      console.log(`   - Items processed: ${items.length}`)
      console.log(`   - Matches found: ${matchedCount}`)
      console.log(`   - Average confidence: ${avgConfidence}%`)
      console.log(`   - Success rate: ${Math.round((matchedCount / items.length) * 100)}%`)
      console.log(`   - Total time: ${duration}s (${(items.length / duration).toFixed(1)} items/sec)`)
      
      // Generate output Excel file
      const outputPath = await this.generateOutputExcel(matches, jobId, originalFileName)
      
      return {
        outputPath,
        totalMatched: matchedCount,
        averageConfidence: avgConfidence,
        matches
      }
      
    } catch (error) {
      console.error(`❌ Error in Cohere embedding matching:`, error)
      throw error
    }
  }

  /**
   * Create query text from BOQ item
   */
  createQueryText(boqItem) {
    const parts = [
      boqItem.description || '',
      boqItem.unit || '',
      boqItem.section || ''
    ].filter(part => part);
    
    return parts.join(' ').toLowerCase();
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
    
    if (!bestItem) {
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
    
    // Always return a match if confidence > 5%
    if (confidence > 5) {
      return {
        item: bestItem,
        confidence: confidence,
        reason: `Semantic similarity: ${Math.round(bestScore * 100)}%${unitBonus > 0 ? `, Unit match: +${unitBonus}%` : ''}`
      };
    }
    
    return null;
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
    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const baseName = path.basename(originalFileName, path.extname(originalFileName))
    const outputFileName = `cohere-ai-results-${jobId}-${baseName}_Results.xlsx`
    const outputPath = path.join(outputDir, outputFileName)

    // Import XLSX dynamically
    const XLSX = await import('xlsx')
    
    // Create workbook with matches
    const wsData = [
      ['Original Description', 'Quantity', 'Unit', 'Matched Description', 'Matched Rate', 'Matched Unit', 'Total Amount', 'Confidence %', 'Reasoning']
    ]

    matches.forEach(match => {
      wsData.push([
        match.original_description,
        match.quantity,
        match.unit,
        match.matched_description || 'No match',
        match.matched_rate || 0,
        match.matched_unit || '',
        match.total_amount || 0,
        Math.round((match.confidence || 0) * 100),
        match.reasoning || ''
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'AI Matched Results')
    
    XLSX.writeFile(wb, outputPath)
    
    return outputPath
  }
} 