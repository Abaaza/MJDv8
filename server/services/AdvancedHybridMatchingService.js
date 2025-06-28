import levenshtein from 'fast-levenshtein'
import natural from 'natural'

export class AdvancedHybridMatchingService {
  constructor(cohereMatcher, openAIMatcher, localMatcher) {
    this.cohereMatcher = cohereMatcher
    this.openAIMatcher = openAIMatcher
    this.localMatcher = localMatcher
    
    // Advanced configuration
    this.config = {
      // Weighting factors for different matching approaches
      weights: {
        semantic_cohere: 0.35,      // Cohere semantic similarity
        semantic_openai: 0.35,      // OpenAI semantic similarity
        string_similarity: 0.15,     // String-based matching
        domain_knowledge: 0.10,     // Construction domain rules
        context_validation: 0.05    // Context and unit validation
      },
      
      // Confidence thresholds
      thresholds: {
        excellent: 0.85,    // Auto-accept matches
        good: 0.70,         // High confidence matches
        moderate: 0.55,     // Moderate confidence matches
        poor: 0.40,         // Low confidence matches
        reject: 0.30        // Below this = no match
      },
      
      // Pre-filtering settings
      prefilter: {
        max_candidates: 50,   // Limit candidates for detailed analysis
        min_string_score: 0.3 // Minimum string similarity for consideration
      }
    }
    
    // Construction domain knowledge
    this.domainRules = {
      // Unit compatibility mappings
      unitCompatibility: new Map([
        ['m', ['meter', 'metre', 'm', 'linear', 'length']],
        ['m2', ['m²', 'sqm', 'square', 'area', 'm2']],
        ['m3', ['m³', 'cum', 'cubic', 'volume', 'm3']],
        ['kg', ['kilogram', 'weight', 'kg', 'kilo']],
        ['nr', ['number', 'each', 'item', 'piece', 'no']],
        ['tonne', ['ton', 'tonne', 't', 'tonnes']],
        ['l', ['litre', 'liter', 'liquid', 'l']],
        ['hour', ['hr', 'hours', 'time', 'labour']]
      ]),
      
      // Material categories and their synonyms
      materialCategories: new Map([
        ['concrete', ['concrete', 'cement', 'rc', 'reinforced', 'cast', 'insitu']],
        ['steel', ['steel', 'rebar', 'reinforcement', 'ms', 'mild', 'iron', 'metal']],
        ['excavation', ['excavation', 'dig', 'earth', 'soil', 'ground', 'foundation']],
        ['masonry', ['brick', 'block', 'masonry', 'wall', 'partition']],
        ['waterproof', ['waterproof', 'damp', 'moisture', 'seal', 'membrane']],
        ['formwork', ['formwork', 'shuttering', 'mould', 'casting', 'framework']],
        ['drainage', ['drain', 'pipe', 'sewer', 'water', 'plumbing']],
        ['finishing', ['paint', 'plaster', 'render', 'finish', 'coating']]
      ]),
      
      // Quantity ranges for validation
      quantityValidation: {
        'concrete': { min: 0.1, max: 10000, unit: 'm3' },
        'steel': { min: 1, max: 50000, unit: 'kg' },
        'excavation': { min: 1, max: 100000, unit: 'm3' },
        'paint': { min: 0.1, max: 10000, unit: 'm2' }
      }
    }
  }

  /**
   * Advanced hybrid matching with multi-stage approach
   * Enhanced for Vercel timeout management
   */
  async matchItems(boqItems, priceList, jobId, updateJobStatus) {
    console.log('🚀 [ADVANCED HYBRID] Starting advanced hybrid matching...')
    console.log(`📋 Items to match: ${boqItems.length}`)
    console.log(`💰 Price list entries: ${priceList.length}`)
    
    // Vercel timeout management
    const startTime = Date.now()
    const maxProcessingTime = 240 * 1000 // 4 minutes for matching phase
    
    const checkTimeout = (phase = 'unknown') => {
      const elapsed = Date.now() - startTime
      const remaining = maxProcessingTime - elapsed
      console.log(`⏱️ [ADVANCED HYBRID TIMEOUT] ${phase}: ${Math.round(elapsed/1000)}s elapsed, ${Math.round(remaining/1000)}s remaining`)
      
      if (elapsed > maxProcessingTime) {
        throw new Error(`Advanced hybrid matching timeout after ${Math.round(elapsed/1000)}s in phase: ${phase}`)
      }
      
      return { elapsed, remaining }
    }
    
    const results = []
    let processedCount = 0
    
    // Stage 1: Pre-compute embeddings for both AI services
    await updateJobStatus(jobId, 'processing', 50, 'Advanced Hybrid: Computing AI embeddings...')
    checkTimeout('embedding-computation-start')
    
    const embeddings = await this.computeAllEmbeddings(boqItems, priceList, jobId, updateJobStatus)
    checkTimeout('embedding-computation-complete')
    
    // Stage 2: Process each item with multi-technique matching
    for (let i = 0; i < boqItems.length; i++) {
      const item = boqItems[i]
      
      try {
        console.log(`🔍 [ADVANCED HYBRID] Processing item ${i + 1}/${boqItems.length}: "${item.description?.substring(0, 50)}..."`)
        
        // Multi-stage matching process
        const match = await this.performAdvancedMatching(item, priceList, embeddings, i)
        
        results.push({
          original_item: item,
          matched: match.confidence >= this.config.thresholds.reject,
          matched_item: match.confidence >= this.config.thresholds.reject ? match.bestMatch : null,
          confidence: match.confidence,
          similarity_score: match.confidence,
          match_details: match.details,
          matching_method: 'advanced_hybrid'
        })
        
        processedCount++
        
        // Update progress every 10 items and check timeout
        if (processedCount % 10 === 0) {
          const progress = 60 + Math.round((processedCount / boqItems.length) * 25) // 60-85%
          await updateJobStatus(jobId, 'processing', progress, 
            `Advanced Hybrid: Matched ${processedCount}/${boqItems.length} items`)
          
          // Check timeout every 10 items
          checkTimeout(`item-processing-${processedCount}`)
        }
        
        // For large datasets, check timeout more frequently (every 50 items)
        if (boqItems.length > 500 && processedCount % 50 === 0) {
          checkTimeout(`bulk-processing-${processedCount}`)
        }
        
      } catch (error) {
        console.error(`❌ [ADVANCED HYBRID] Error matching item ${i + 1}:`, error)
        
        // Add failed match
        results.push({
          original_item: item,
          matched: false,
          matched_item: null,
          confidence: 0,
          similarity_score: 0,
          match_details: { error: error.message },
          matching_method: 'advanced_hybrid'
        })
      }
    }
    
    const totalMatched = results.filter(r => r.matched).length
    const averageConfidence = totalMatched > 0 
      ? results.filter(r => r.matched).reduce((sum, r) => sum + r.confidence, 0) / totalMatched 
      : 0
    
    // Final timeout check and performance logging
    const finalTiming = checkTimeout('matching-completion')
    console.log(`✅ [ADVANCED HYBRID] Matching completed: ${totalMatched}/${boqItems.length} matched`)
    console.log(`📊 [ADVANCED HYBRID] Average confidence: ${(averageConfidence * 100).toFixed(1)}%`)
    console.log(`⏱️ [ADVANCED HYBRID] Total processing time: ${Math.round(finalTiming.elapsed/1000)}s`)
    
    await updateJobStatus(jobId, 'processing', 85, 
      `Advanced Hybrid: Completed ${totalMatched}/${boqItems.length} matches (${Math.round(finalTiming.elapsed/1000)}s)`)
    
    return {
      matches: results,
      totalMatched,
      averageConfidence,
      outputPath: null // Will be generated by main service
    }
  }

  /**
   * Compute embeddings from both AI services
   */
  async computeAllEmbeddings(boqItems, priceList, jobId, updateJobStatus) {
    const embeddings = {
      cohere: { items: new Map(), priceList: new Map() },
      openai: { items: new Map(), priceList: new Map() }
    }
    
    try {
      // Cohere embeddings with timeout check
      if (this.cohereMatcher) {
        console.log('🔄 [ADVANCED HYBRID] Computing Cohere embeddings...')
        await updateJobStatus(jobId, 'processing', 52, 'Advanced Hybrid: Computing Cohere embeddings...')
        
        const cohereStartTime = Date.now()
        
        // Pre-compute Cohere embeddings for price list
        await this.cohereMatcher.precomputePriceListEmbeddings(priceList, jobId, async () => {})
        
        // Get Cohere embeddings for BoQ items
        const cohereItemEmbeddings = await this.cohereMatcher.generateEmbeddings(
          boqItems.map(item => item.description || '')
        )
        
        boqItems.forEach((item, index) => {
          embeddings.cohere.items.set(item.id || index, cohereItemEmbeddings[index])
        })
        
        console.log('✅ [ADVANCED HYBRID] Cohere embeddings completed')
      }
      
      // OpenAI embeddings
      if (this.openAIMatcher) {
        console.log('🔄 [ADVANCED HYBRID] Computing OpenAI embeddings...')
        await updateJobStatus(jobId, 'processing', 55, 'Advanced Hybrid: Computing OpenAI embeddings...')
        
        // Pre-compute OpenAI embeddings for price list
        await this.openAIMatcher.precomputePriceListEmbeddings(priceList, jobId, async () => {})
        
        // Get OpenAI embeddings for BoQ items
        const openaiItemEmbeddings = await this.openAIMatcher.generateEmbeddings(
          boqItems.map(item => item.description || '')
        )
        
        boqItems.forEach((item, index) => {
          embeddings.openai.items.set(item.id || index, openaiItemEmbeddings[index])
        })
        
        console.log('✅ [ADVANCED HYBRID] OpenAI embeddings completed')
      }
      
    } catch (error) {
      console.error('⚠️ [ADVANCED HYBRID] Embedding computation failed:', error)
      // Continue with available embeddings
    }
    
    return embeddings
  }

  /**
   * Perform advanced multi-technique matching for a single item
   */
  async performAdvancedMatching(boqItem, priceList, embeddings, itemIndex) {
    const itemId = boqItem.id || itemIndex
    const description = boqItem.description || ''
    
    console.log(`🔍 [ADVANCED HYBRID] Multi-stage matching for: "${description.substring(0, 80)}..."`)
    
    // Stage 1: Pre-filtering with fast string matching
    const candidates = this.preFilterCandidates(boqItem, priceList)
    console.log(`🎯 [ADVANCED HYBRID] Pre-filtered to ${candidates.length} candidates`)
    
    // Stage 2: Multi-technique scoring
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const scores = await this.computeMultiTechniqueScores(
          boqItem, candidate, embeddings, itemId
        )
        
        // Weighted combination of all techniques
        const finalScore = this.combineScores(scores)
        
        return {
          ...candidate,
          scores,
          finalScore,
          confidence: finalScore
        }
      })
    )
    
    // Stage 3: Sort by final score and apply confidence thresholds
    scoredCandidates.sort((a, b) => b.finalScore - a.finalScore)
    
    const bestMatch = scoredCandidates[0]
    const confidence = bestMatch ? bestMatch.finalScore : 0
    
    // Stage 4: Confidence categorization
    let confidenceCategory = 'rejected'
    if (confidence >= this.config.thresholds.excellent) confidenceCategory = 'excellent'
    else if (confidence >= this.config.thresholds.good) confidenceCategory = 'good'
    else if (confidence >= this.config.thresholds.moderate) confidenceCategory = 'moderate'
    else if (confidence >= this.config.thresholds.poor) confidenceCategory = 'poor'
    
    console.log(`📊 [ADVANCED HYBRID] Best match: ${confidence.toFixed(3)} (${confidenceCategory})`)
    
    return {
      bestMatch: bestMatch || null,
      confidence,
      details: {
        category: confidenceCategory,
        candidatesEvaluated: candidates.length,
        topScores: scoredCandidates.slice(0, 3).map(c => ({
          description: c.description?.substring(0, 50),
          score: c.finalScore.toFixed(3),
          breakdown: c.scores
        }))
      }
    }
  }

  /**
   * Pre-filter candidates using fast string matching
   */
  preFilterCandidates(boqItem, priceList) {
    const description = (boqItem.description || '').toLowerCase()
    const words = description.split(/\s+/).filter(w => w.length > 2)
    
    // Score each price list item for basic relevance
    const scored = priceList.map(priceItem => {
      const priceDesc = (priceItem.description || priceItem.full_context || '').toLowerCase()
      
      // Basic string similarity
      const levenScore = 1 - (levenshtein.get(description, priceDesc) / Math.max(description.length, priceDesc.length))
      
      // Word overlap score
      const priceWords = priceDesc.split(/\s+/)
      const wordMatches = words.filter(word => priceWords.some(pw => pw.includes(word) || word.includes(pw)))
      const wordScore = wordMatches.length / words.length
      
      // Combined pre-filter score
      const prefilterScore = (levenScore * 0.6) + (wordScore * 0.4)
      
      return {
        ...priceItem,
        prefilterScore
      }
    })
    
    // Return top candidates above threshold
    return scored
      .filter(item => item.prefilterScore >= this.config.prefilter.min_string_score)
      .sort((a, b) => b.prefilterScore - a.prefilterScore)
      .slice(0, this.config.prefilter.max_candidates)
  }

  /**
   * Compute scores using multiple techniques
   */
  async computeMultiTechniqueScores(boqItem, candidate, embeddings, itemId) {
    const scores = {}
    
    // 1. Semantic similarity using Cohere
    scores.semantic_cohere = 0
    if (embeddings.cohere.items.has(itemId) && this.cohereMatcher?.embeddings) {
      const itemEmbedding = embeddings.cohere.items.get(itemId)
      const candidateData = this.cohereMatcher.embeddings.get(candidate.id)
      
      if (itemEmbedding && candidateData) {
        scores.semantic_cohere = this.computeCosineSimilarity(itemEmbedding, candidateData.embedding)
      }
    }
    
    // 2. Semantic similarity using OpenAI
    scores.semantic_openai = 0
    if (embeddings.openai.items.has(itemId) && this.openAIMatcher?.embeddings) {
      const itemEmbedding = embeddings.openai.items.get(itemId)
      const candidateData = this.openAIMatcher.embeddings.get(candidate.id)
      
      if (itemEmbedding && candidateData) {
        scores.semantic_openai = this.computeCosineSimilarity(itemEmbedding, candidateData.embedding)
      }
    }
    
    // 3. Advanced string similarity
    scores.string_similarity = this.computeAdvancedStringSimilarity(boqItem, candidate)
    
    // 4. Domain knowledge score
    scores.domain_knowledge = this.computeDomainKnowledgeScore(boqItem, candidate)
    
    // 5. Context validation score
    scores.context_validation = this.computeContextValidationScore(boqItem, candidate)
    
    return scores
  }

  /**
   * Compute cosine similarity between two embeddings
   */
  computeCosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0
    }
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
    return magnitude > 0 ? dotProduct / magnitude : 0
  }

  /**
   * Compute advanced string similarity using multiple algorithms
   */
  computeAdvancedStringSimilarity(boqItem, candidate) {
    const desc1 = (boqItem.description || '').toLowerCase()
    const desc2 = (candidate.description || candidate.full_context || '').toLowerCase()
    
    // Multiple string similarity algorithms
    const levenshteinScore = 1 - (levenshtein.get(desc1, desc2) / Math.max(desc1.length, desc2.length))
    const jaccardScore = this.computeJaccardSimilarity(desc1, desc2)
    const ngramScore = this.computeNGramSimilarity(desc1, desc2)
    
    // Weighted combination
    return (levenshteinScore * 0.4) + (jaccardScore * 0.3) + (ngramScore * 0.3)
  }

  /**
   * Compute Jaccard similarity for word sets
   */
  computeJaccardSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2))
    const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  /**
   * Compute N-gram similarity
   */
  computeNGramSimilarity(str1, str2, n = 3) {
    const ngrams1 = this.generateNGrams(str1, n)
    const ngrams2 = this.generateNGrams(str2, n)
    
    const set1 = new Set(ngrams1)
    const set2 = new Set(ngrams2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  /**
   * Generate N-grams from string
   */
  generateNGrams(str, n) {
    const ngrams = []
    const cleaned = str.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
    
    for (let i = 0; i <= cleaned.length - n; i++) {
      ngrams.push(cleaned.substring(i, i + n))
    }
    
    return ngrams
  }

  /**
   * Compute domain knowledge score based on construction terminology
   */
  computeDomainKnowledgeScore(boqItem, candidate) {
    let score = 0
    
    const boqDesc = (boqItem.description || '').toLowerCase()
    const candDesc = (candidate.description || candidate.full_context || '').toLowerCase()
    
    // Check material category matches
    for (const [category, terms] of this.domainRules.materialCategories) {
      const boqHasCategory = terms.some(term => boqDesc.includes(term))
      const candHasCategory = terms.some(term => candDesc.includes(term))
      
      if (boqHasCategory && candHasCategory) {
        score += 0.3 // Strong category match
      } else if (boqHasCategory || candHasCategory) {
        score -= 0.1 // Category mismatch penalty
      }
    }
    
    // Unit compatibility check
    if (boqItem.unit && candidate.unit) {
      const unitsCompatible = this.areUnitsCompatible(boqItem.unit, candidate.unit)
      if (unitsCompatible) {
        score += 0.4
      } else {
        score -= 0.2 // Unit mismatch penalty
      }
    }
    
    return Math.max(0, Math.min(1, score))
  }

  /**
   * Check if units are compatible
   */
  areUnitsCompatible(unit1, unit2) {
    if (!unit1 || !unit2) return true // No penalty if units missing
    
    const u1 = unit1.toLowerCase().trim()
    const u2 = unit2.toLowerCase().trim()
    
    if (u1 === u2) return true
    
    // Check compatibility mappings
    for (const [baseUnit, variants] of this.domainRules.unitCompatibility) {
      if ((variants.includes(u1) || u1 === baseUnit) && 
          (variants.includes(u2) || u2 === baseUnit)) {
        return true
      }
    }
    
    return false
  }

  /**
   * Compute context validation score
   */
  computeContextValidationScore(boqItem, candidate) {
    let score = 0.5 // Neutral starting point
    
    // Quantity range validation
    if (boqItem.quantity && candidate.rate) {
      const quantity = parseFloat(boqItem.quantity)
      const rate = parseFloat(candidate.rate)
      
      if (!isNaN(quantity) && !isNaN(rate)) {
        // Check if quantity makes sense for the item type
        const totalValue = quantity * rate
        
        // Reasonable total value range
        if (totalValue > 0 && totalValue < 1000000) {
          score += 0.2
        }
        
        // Reasonable quantity ranges
        if (quantity > 0 && quantity < 100000) {
          score += 0.1
        }
      }
    }
    
    // Description length similarity (similar complexity items)
    const boqLen = (boqItem.description || '').length
    const candLen = (candidate.description || candidate.full_context || '').length
    
    if (boqLen > 0 && candLen > 0) {
      const lengthRatio = Math.min(boqLen, candLen) / Math.max(boqLen, candLen)
      score += lengthRatio * 0.2
    }
    
    return Math.max(0, Math.min(1, score))
  }

  /**
   * Combine all scores using weighted formula
   */
  combineScores(scores) {
    const weights = this.config.weights
    
    let totalScore = 0
    let totalWeight = 0
    
    // Only use available scores
    Object.entries(weights).forEach(([technique, weight]) => {
      if (scores[technique] !== undefined && scores[technique] !== null) {
        totalScore += scores[technique] * weight
        totalWeight += weight
      }
    })
    
    // Normalize by actual total weight used
    return totalWeight > 0 ? totalScore / totalWeight : 0
  }
}