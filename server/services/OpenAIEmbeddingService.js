import fetch from 'node-fetch'

export class OpenAIEmbeddingService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY
    this.embeddings = new Map()
    this.embeddingsByCategory = new Map()
    this.BATCH_SIZE = 300 // OpenAI supports up to 2048 inputs per request
    this.model = 'text-embedding-3-large'
    this.dimensions = 3072 // Default dimensions for text-embedding-3-large
    
    console.log('🤖 [OPENAI] Initializing GPT embedding service...')
    console.log(`🔧 [OPENAI] Model: ${this.model} | Dimensions: ${this.dimensions} | Batch: ${this.BATCH_SIZE}`)
  }

  /**
   * Generate embeddings for a batch of texts using OpenAI
   */
  async generateEmbeddings(texts) {
    if (!this.apiKey) {
      throw new Error('🚫 [OPENAI] GPT API credentials not configured - missing access token')
    }

    try {
      console.log(`🚀 [OPENAI] Transmitting ${texts.length} texts to GPT embedding model...`)
      console.log(`🔐 [OPENAI] Authenticating with OpenAI API servers...`)
      
      const startTime = Date.now()
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: texts,
          model: this.model,
          encoding_format: 'float'
        })
      })
      
      const apiTime = Date.now() - startTime

      if (!response.ok) {
        const error = await response.json()
        console.error(`❌ [OPENAI] GPT API returned error: ${error.error?.message || response.statusText}`)
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const embeddings = data.data.map(item => item.embedding)
      
      console.log(`⚡ [OPENAI] GPT embeddings generated in ${apiTime}ms | ${embeddings.length} vectors | ${this.dimensions}D space`)
      console.log(`🧮 [OPENAI] API performance: ${Math.round(texts.length / (apiTime / 1000))} embeddings/sec`)
      
      return embeddings
    } catch (error) {
      console.error('❌ [OPENAI] GPT embedding generation failed:', error)
      throw error
    }
  }

  /**
   * Pre-compute embeddings for all price list items
   */
  async precomputePriceListEmbeddings(priceItems, jobId, progressTracker, pmService = null) {
    console.log(`⚡ [OPENAI] Pre-computing embeddings for ${priceItems.length} price items...`)
    console.log(`🔧 [OPENAI] Configuration: Batch size = ${this.BATCH_SIZE} items`)
    
    this.embeddings.clear()
    this.embeddingsByCategory = new Map()
    const startTime = Date.now()
    
    const totalBatches = Math.ceil(priceItems.length / this.BATCH_SIZE)
    console.log(`📊 [OPENAI] Neural processing plan: ${totalBatches} batches total`)
    console.log(`🚀 [OPENAI] *** OPENAI NEURAL NETWORK INITIALIZATION ***`)
    
    for (let i = 0; i < priceItems.length; i += this.BATCH_SIZE) {
      const batch = priceItems.slice(i, i + this.BATCH_SIZE)
      const batchTexts = batch.map(item => 
        item.full_context || `${item.description} ${item.unit || ''} ${item.category || ''}`
      )
      
      const currentBatch = Math.floor(i / this.BATCH_SIZE) + 1
      const batchStartTime = Date.now()
      
      try {
        console.log(`🔄 [OPENAI] Processing embedding batch ${currentBatch}/${totalBatches} (${batch.length} items)`)
        console.log(`🚀 [OPENAI] *** NEURAL BATCH ${currentBatch}/${totalBatches} PROCESSING ***`)
        const embeddings = await this.generateEmbeddings(batchTexts)
        
        console.log(`✅ [OPENAI] Got embeddings for batch ${currentBatch}, storing...`)
        
        // Store embeddings
        batch.forEach((item, index) => {
          this.embeddings.set(item.id, {
            embedding: embeddings[index],
            item: item
          })
          
          // Also store by category
          if (item.category) {
            const categoryKey = item.category.toLowerCase()
            if (!this.embeddingsByCategory.has(categoryKey)) {
              this.embeddingsByCategory.set(categoryKey, new Map())
            }
            this.embeddingsByCategory.get(categoryKey).set(item.id, {
              embedding: embeddings[index],
              item: item
            })
          }
        })
        
        // Enhanced progress tracking with performance metrics
        const batchEndTime = Date.now()
        const batchTime = batchEndTime - batchStartTime
        const vectorsPerSecond = Math.round(batch.length / (batchTime / 1000))
        const itemsProcessed = Math.min(i + batch.length, priceItems.length)
        
        if (pmService && pmService.updateJobStatus && progressTracker) {
          // Use the progress tracker from main service for proper range coordination
          const batchProgress = Math.round((currentBatch / totalBatches) * 100)
          const actualProgress = progressTracker.startPercent + Math.round((batchProgress / 100) * (progressTracker.endPercent - progressTracker.startPercent))
          
          console.log(`📊 [OPENAI] Neural network performance: ${vectorsPerSecond} vectors/sec`)
          console.log(`🎯 [OPENAI] Broadcasting progress to frontend dashboard...`)
          
          const updateResult = await pmService.updateJobStatus(
            jobId, 
            'processing', 
            actualProgress,
            `🤖 OPENAI: Neural batch ${currentBatch}/${totalBatches} | ${itemsProcessed}/${priceItems.length} items vectorized | ${vectorsPerSecond} vectors/sec`,
            { 
              total_items: priceItems.length,
              processed_items: itemsProcessed,
              current_phase: 'embedding_computation',
              model_type: 'openai',
              batch_performance: {
                vectors_per_second: vectorsPerSecond,
                batch_time_ms: batchTime,
                current_batch: currentBatch,
                total_batches: totalBatches
              }
            }
          )
          
          if (!updateResult) {
            console.error(`❌ [OPENAI] Neural network status update failed for batch ${currentBatch}`)
          } else {
            console.log(`✅ [OPENAI] Dashboard successfully updated with neural progress`)
          }
        }
        
        const overallProgress = Math.round((currentBatch / totalBatches) * 100)
        console.log(`🚀 [OPENAI] Embedding phase progress: ${overallProgress}% | ${itemsProcessed}/${priceItems.length} items neural-processed`)
        console.log(`⚡ [OPENAI] Batch ${currentBatch} completed in ${(batchTime / 1000).toFixed(2)}s | ${vectorsPerSecond} vectors/sec`)
        
        // Enhanced delay with progress indication
        console.log(`⏳ [OPENAI] Cooling neural processors... (200ms)`)
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`❌ [OPENAI] Error processing batch ${currentBatch}:`, error)
        // Continue with other batches even if one fails
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    const avgTimePerItem = (duration / priceItems.length * 1000).toFixed(1)
    
    console.log(`✅ [OPENAI] *** NEURAL NETWORK COMPUTATION COMPLETE ***`)
    console.log(`📊 [OPENAI] Performance summary:`)
    console.log(`   📈 Total items processed: ${priceItems.length}`)
    console.log(`   ⏱️  Total processing time: ${duration}s`)
    console.log(`   🚀 Average time per item: ${avgTimePerItem}ms`)
    console.log(`   📚 Embeddings stored in memory: ${this.embeddings.size}`)
    console.log(`   🏢 Categories indexed: ${this.embeddingsByCategory.size}`)
    console.log(`🎯 [OPENAI] Neural network ready for hybrid matching phase`)
  }

  /**
   * Match items using OpenAI embeddings
   */
  async matchItems(boqItems, priceList, jobId, updateJobStatus) {
    console.log(`🤖 [OPENAI] Starting embedding-based matching for ${boqItems.length} items`)
    
    const matches = []
    const startTime = Date.now()
    
    // Process BOQ items in batches
    for (let i = 0; i < boqItems.length; i += this.BATCH_SIZE) {
      const batch = boqItems.slice(i, i + this.BATCH_SIZE)
      
      try {
        // Generate embeddings for BOQ items
        const boqTexts = batch.map(item => 
          `${item.description} ${item.unit || ''} ${item.section_header || ''}`
        )
        
        const boqEmbeddings = await this.generateEmbeddings(boqTexts)
        
        // Find best matches for each item
        batch.forEach((boqItem, index) => {
          const queryEmbedding = boqEmbeddings[index]
          const match = this.findBestEmbeddingMatch(queryEmbedding, boqItem)
          
          matches.push({
            ...boqItem,
            matched: !!match,
            matched_description: match?.description || '',
            matched_rate: match?.rate || 0,
            matched_unit: match?.unit || '',
            matched_price_item_id: match?.id || null,
            similarity_score: match?.similarity || 0,
            confidence: match?.similarity || 0,
            match_method: 'openai'
          })
        })
        
        // Update progress
        const progress = Math.round(((i + batch.length) / boqItems.length) * 100)
        if (updateJobStatus) {
          await updateJobStatus(jobId, 'processing', progress, 
            `Matching items... ${i + batch.length}/${boqItems.length} (${matches.filter(m => m.matched).length} matches found)`)
        }
        
      } catch (error) {
        console.error(`❌ [OPENAI] Error processing batch:`, error)
        // Add unmatched items for this batch
        batch.forEach(item => {
          matches.push({
            ...item,
            matched: false,
            matched_description: '',
            matched_rate: 0,
            matched_unit: '',
            matched_price_item_id: null,
            similarity_score: 0,
            confidence: 0,
            match_method: 'openai'
          })
        })
      }
    }
    
    const duration = Date.now() - startTime
    const matchedCount = matches.filter(m => m.matched).length
    const avgConfidence = matchedCount > 0 
      ? matches.filter(m => m.matched).reduce((sum, m) => sum + m.confidence, 0) / matchedCount 
      : 0
    
    console.log(`✅ [OPENAI] Matching completed in ${duration}ms`)
    console.log(`📊 [OPENAI] Results: ${matchedCount}/${boqItems.length} matched (${(avgConfidence * 100).toFixed(1)}% avg confidence)`)
    
    return {
      matches,
      totalMatched: matchedCount,
      averageConfidence: Math.round(avgConfidence * 100)
    }
  }

  /**
   * Find best matching item using cosine similarity
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
        ...bestMatch,
        similarity: Math.max(0.01, bestSimilarity)
      }
    }
    
    // If absolutely no match found (which should be rare), return the first item with minimal confidence
    if (this.embeddings.size > 0) {
      const firstItem = this.embeddings.values().next().value
      return {
        ...firstItem.item,
        similarity: 0.01
      }
    }
    
    return null
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }
    
    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)
    
    if (norm1 === 0 || norm2 === 0) return 0
    
    return dotProduct / (norm1 * norm2)
  }

  /**
   * Identify category from item details
   */
  identifyCategory(item) {
    const categoryKeywords = {
      'excavation': ['excavation', 'earthwork', 'digging', 'cut', 'fill', 'soil'],
      'concrete': ['concrete', 'rcc', 'pcc', 'cement', 'mortar'],
      'steel': ['steel', 'rebar', 'reinforcement', 'tor', 'tmt'],
      'masonry': ['brick', 'block', 'masonry', 'wall'],
      'finishing': ['paint', 'tile', 'flooring', 'ceiling', 'plaster'],
      'plumbing': ['pipe', 'plumbing', 'water', 'drainage'],
      'electrical': ['wire', 'cable', 'electrical', 'switch', 'socket']
    }
    
    const text = `${item.description} ${item.section_header || ''} ${item.sheet_name || ''}`.toLowerCase()
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return { category, confidence: 0.8 }
      }
    }
    
    return { category: null, confidence: 0 }
  }
} 