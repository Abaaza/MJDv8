import levenshtein from 'fast-levenshtein'
import natural from 'natural'
import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class LocalPriceMatchingService {
  constructor() {
    this.updateJobStatus = null // Will be set by PriceMatchingService
    this.outputDir = path.join(__dirname, '..', 'output')
    
    // Ensure output directory exists
    fs.ensureDirSync(this.outputDir)
    
    // Initialize NLP tools
    this.stemmer = natural.PorterStemmer
    this.tokenizer = new natural.WordTokenizer()
    
    // Synonym map for better matching
    this.synonymMap = new Map([
      ['rebar', 'reinforcement'], ['reinforcement', 'rebar'],
      ['concrete', 'concrete'], ['cement', 'concrete'],
      ['steel', 'steel'], ['ms', 'steel'], ['mild', 'steel'],
      ['excavation', 'excavation'], ['dig', 'excavation'], ['digging', 'excavation'],
      ['brick', 'brick'], ['block', 'block'], ['masonry', 'masonry'],
      ['paint', 'paint'], ['painting', 'paint'], ['coated', 'paint'],
      ['plaster', 'plaster'], ['plastering', 'plaster'], ['render', 'plaster'],
      ['tile', 'tile'], ['tiles', 'tile'], ['tiling', 'tile'],
      ['door', 'door'], ['doors', 'door'], ['window', 'window'], ['windows', 'window'],
      ['pipe', 'pipe'], ['pipes', 'pipe'], ['piping', 'pipe'],
      ['wire', 'wire'], ['cable', 'cable'], ['wiring', 'wire'],
      ['waterproof', 'waterproof'], ['waterproofing', 'waterproof'], ['water', 'water'],
      ['ground', 'ground'], ['foundation', 'foundation'], ['footing', 'foundation'],
      ['toxic', 'hazardous'], ['hazardous', 'hazardous'], ['hazard', 'hazardous'],
      ['material', 'material'], ['materials', 'material'],
      ['below', 'below'], ['under', 'below'], ['beneath', 'below'],
      ['level', 'level'], ['depth', 'depth'],
      // Metal terms
      ['iron', 'metal'], ['aluminum', 'metal'], ['aluminium', 'metal'], ['copper', 'metal']
    ])
    
    // Stop words to remove from descriptions
    this.stopWords = new Set([
      'the', 'and', 'of', 'to', 'in', 'for', 'on', 'at', 'by', 'from', 'with',
      'a', 'an', 'be', 'is', 'are', 'as', 'it', 'its', 'into', 'or', 'this',
      'that', 'will', 'shall', 'would', 'could', 'should', 'may', 'might',
      'per', 'each', 'all', 'any', 'some', 'no', 'only', 'such',
      'than', 'too', 'very', 'can', 'had', 'her', 'was', 'one', 'our', 'out',
      'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
      'see', 'two', 'way', 'who', 'boy', 'did', 'use', 'she', 'they', 'we'
    ])
  }

  /**
   * Identify category from various sources
   */
  identifyCategory(item, headerInfo, sheetName) {
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
          console.log(`📂 Category from header: ${category} (${item.section_header})`)
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
          console.log(`📂 Category from sheet: ${category} (${sheetName})`)
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
            console.log(`📂 Category from description: ${category} (score: ${confidenceScore})`)
          }
        }
      }
    }
    
    return { category: identifiedCategory, confidence: confidenceScore }
  }

  /**
   * Filter price list by category
   */
  filterPriceListByCategory(priceList, category) {
    if (!category) return priceList
    
    const categoryFiltered = priceList.filter(item => {
      if (item.category) {
        return item.category.toLowerCase().includes(category.toLowerCase())
      }
      return false
    })
    
    console.log(`📂 Filtered price list: ${categoryFiltered.length} items in category '${category}'`)
    return categoryFiltered
  }

  /**
   * Main function to match items against price list
   */
  async matchItems(items, priceList, jobId, originalFileName, updateJobStatus) {
    try {
      console.log(`🔍 [LOCAL MATCH DEBUG] Starting local price matching...`)
      console.log(`📋 [LOCAL MATCH DEBUG] Items to match: ${items.length}`)
      console.log(`💰 [LOCAL MATCH DEBUG] Price list entries: ${priceList.length}`)
      console.log(`🆔 [LOCAL MATCH DEBUG] Job ID: ${jobId}`)
      console.log(`📄 [LOCAL MATCH DEBUG] Original filename: ${originalFileName}`)
      console.log(`🔧 [LOCAL MATCH DEBUG] updateJobStatus function type: ${typeof updateJobStatus}`)
      
      // Test the updateJobStatus function immediately
      if (typeof updateJobStatus !== 'function') {
        throw new Error('updateJobStatus is not a function!')
      }
      
      console.log(`🧪 [LOCAL MATCH DEBUG] Testing updateJobStatus function...`)
      const testResult = await updateJobStatus(jobId, 'processing', 45, 'Local matching initialized', {
        total_items: items.length,
        matched_items: 0
      })
      console.log(`🧪 [LOCAL MATCH DEBUG] Test updateJobStatus result: ${testResult}`)
      
      // Preprocess price list descriptions with enhanced processing
      console.log(`🔄 [LOCAL MATCH DEBUG] Preprocessing price list...`)
      const processedPriceList = priceList.map(item => ({
        ...item,
        processed_description: this.preprocessDescription(item.description || item.full_context),
        tokens: this.tokenizeDescription(item.description || item.full_context),
        keywords: this.extractKeywords(item.description || item.full_context)
      }))
      console.log(`✅ [LOCAL MATCH DEBUG] Price list preprocessed successfully`)
      
      const matches = []
      let matchedCount = 0
      let totalConfidence = 0
      
      // Process each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        // Identify category for this item
        const categoryInfo = this.identifyCategory(item, {}, item.sheet_name)
        console.log(`📂 Item ${i + 1}: Category = ${categoryInfo.category || 'none'} (confidence: ${categoryInfo.confidence})`)
        
        const processedItem = this.preprocessDescription(item.description)
        const itemTokens = this.tokenizeDescription(item.description)
        const itemKeywords = this.extractKeywords(item.description)
        
        if (i % 50 === 0) {
          console.log(`📊 Processing item ${i + 1}/${items.length}`)
        }
        
        // Update progress
        const progress = Math.round((i / items.length) * 100)
        if (updateJobStatus) {
          await updateJobStatus(jobId, 'processing', progress, 
            `Matching items... ${i + 1}/${items.length} (${matches.filter(m => m.matched).length} matches found)`)
        }
        
        // Find best match with enhanced algorithm - try category first, then all items
        const match = this.findBestMatchWithCategory(
          processedItem, 
          processedPriceList, 
          itemTokens, 
          itemKeywords,
          categoryInfo.category
        )
        
        // Ensure we always have a match (never null) to guarantee progress updates
        if (match) { // Always process the match since findBestMatch guarantees minimum 1% confidence
          const matchResult = {
            id: `match_${jobId}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            original_description: item.description,
            matched_description: match.item.description || match.item.full_context,
            matched_rate: match.item.rate,
            similarity_score: match.confidence,
            row_number: item.row_number,
            sheet_name: item.sheet_name,
            quantity: item.quantity,
            unit: match.item.unit || '',
            total_amount: item.quantity * match.item.rate,
            matched_price_item_id: match.item.id,
            match_method: match.method,
            section_header: item.section_header || null
          }
          
          matches.push(matchResult)
          matchedCount++
          totalConfidence += match.confidence
          
          console.log(`✅ [LOCAL MATCH DEBUG] Match ${matchedCount} found: "${item.description.substring(0, 40)}..." -> "${match.item.description?.substring(0, 40)}..." (${Math.round(match.confidence * 100)}%)`)
        } else {
          console.error(`❌ [LOCAL MATCH DEBUG] ERROR: No match returned for item ${i + 1}: "${item.description.substring(0, 40)}..."`)
          console.error(`❌ [LOCAL MATCH DEBUG] This should never happen - findBestMatch should always return a match!`)
        }
      }
      
      const avgConfidence = matchedCount > 0 ? Math.round((totalConfidence / matchedCount) * 100) : 0
      
      console.log(`📈 Matching Summary:`)
      console.log(`   - Items processed: ${items.length}`)
      console.log(`   - Matches found: ${matchedCount}`)
      console.log(`   - Average confidence: ${avgConfidence}%`)
      
      // Generate output Excel file
      const outputPath = await this.generateOutputExcel(matches, jobId, originalFileName)
      
      return {
        outputPath,
        totalMatched: matchedCount,
        averageConfidence: avgConfidence,
        matches
      }
      
    } catch (error) {
      console.error(`❌ Error in local price matching:`, error)
      throw error
    }
  }

  /**
   * Preprocess description for better matching
   */
  preprocessDescription(description) {
    if (!description) return ''
    
    let processed = description.toLowerCase()
    
    console.log(`[LOCAL MATCH] Original description: "${description}"`)
    
    // Remove special characters but keep spaces
    processed = processed.replace(/[^\w\s]/g, ' ')
    console.log(`[LOCAL MATCH] After removing special chars: "${processed}"`)
    
    // Normalize units and measurements (replace with generic tokens)
    processed = processed.replace(/\b\d+(?:\.\d+)?\s*(mm|cm|m|inch|in|ft|feet|yard|yd|m2|m3|sqm|cum)\b/g, ' UNIT ')
    
    // Normalize numbers
    processed = processed.replace(/\b\d+(?:\.\d+)?\b/g, ' NUM ')
    console.log(`[LOCAL MATCH] After normalizing units/numbers: "${processed}"`)
    
    // Tokenize
    const tokens = this.tokenizer.tokenize(processed) || []
    console.log(`[LOCAL MATCH] Tokens: [${tokens.join(', ')}]`)
    
    // Process tokens
    const processedTokens = tokens
      .filter(token => token.length > 2) // Remove very short tokens
      .filter(token => !this.stopWords.has(token)) // Remove stop words
      .map(token => {
        // Apply synonyms
        if (this.synonymMap.has(token)) {
          return this.synonymMap.get(token)
        }
        // Apply stemming
        return this.stemmer.stem(token)
      })
      .filter(token => token.length > 1) // Remove tokens that became too short after stemming
    
    console.log(`[LOCAL MATCH] Processed tokens: [${processedTokens.join(', ')}]`)
    const result = processedTokens.join(' ')
    console.log(`[LOCAL MATCH] Final preprocessed: "${result}"`)
    
    return result
  }

  /**
   * Extract important keywords from description
   */
  extractKeywords(description) {
    if (!description) return []
    
    const tokens = this.tokenizeDescription(description)
    const keywords = []
    
    // Extract measurements
    const measurements = description.match(/\b\d+(?:\.\d+)?\s*(?:mm|cm|m|inch|ft|feet|yard|yd|m2|m3|sqm|cum)\b/gi) || []
    keywords.push(...measurements.map(m => m.toLowerCase()))
    
    // Extract material specifications (e.g., "20mm thick", "grade 43")
    const specs = description.match(/\b(?:grade|class|type|size)\s*\w+\b/gi) || []
    keywords.push(...specs.map(s => s.toLowerCase()))
    
    // Extract important construction terms
    const importantTerms = ['concrete', 'steel', 'brick', 'block', 'paint', 'plaster', 
                           'tile', 'door', 'window', 'pipe', 'wire', 'cable', 'beam', 
                           'column', 'slab', 'foundation', 'wall', 'floor', 'ceiling', 
                           'roof', 'reinforcement', 'excavation', 'formwork']
    
    tokens.forEach(token => {
      if (importantTerms.includes(token) || importantTerms.some(term => token.includes(term))) {
        keywords.push(token)
      }
    })
    
    return [...new Set(keywords)] // Remove duplicates
  }

  /**
   * Tokenize description preserving important terms
   */
  tokenizeDescription(description) {
    if (!description) return []
    
    let processed = description.toLowerCase()
    
    // Preserve compound terms by replacing spaces with underscores
    const compoundTerms = [
      'reinforced concrete', 'mild steel', 'tor steel', 'cement mortar',
      'false ceiling', 'suspended ceiling', 'damp proof', 'water proof',
      'fire rated', 'double coat', 'single coat', 'base coat', 'finish coat'
    ]
    
    compoundTerms.forEach(term => {
      processed = processed.replace(new RegExp(term, 'g'), term.replace(/ /g, '_'))
    })
    
    // Tokenize
    const tokens = this.tokenizer.tokenize(processed) || []
    
    // Restore compound terms
    return tokens.map(token => token.replace(/_/g, ' '))
  }

  /**
   * Find best match with category preference
   */
  findBestMatchWithCategory(processedItem, processedPriceList, itemTokens, itemKeywords, category) {
    let bestMatch = null
    
    // First, try matching within the category if identified
    if (category) {
      const categoryItems = this.filterPriceListByCategory(processedPriceList, category)
      if (categoryItems.length > 0) {
        console.log(`🔍 [LOCAL MATCH] Searching within category '${category}' (${categoryItems.length} items)`)
        bestMatch = this.findBestMatch(processedItem, categoryItems, itemTokens, itemKeywords)
        
        // If we found a good match in the category (>40% confidence), use it
        if (bestMatch && bestMatch.confidence > 0.4) {
          console.log(`✅ [LOCAL MATCH] Found category match with ${(bestMatch.confidence * 100).toFixed(2)}% confidence`)
          return bestMatch
        }
      }
    }
    
    // If no good category match, search all items
    console.log(`🔍 [LOCAL MATCH] Searching across all items (category match not sufficient)`)
    const allItemsMatch = this.findBestMatch(processedItem, processedPriceList, itemTokens, itemKeywords)
    
    // If we have both matches, compare and choose the better one
    if (bestMatch && allItemsMatch) {
      // Prefer category match if confidence difference is small
      if (bestMatch.confidence >= allItemsMatch.confidence * 0.8) {
        console.log(`📂 [LOCAL MATCH] Using category match despite lower confidence`)
        return bestMatch
      }
    }
    
    return allItemsMatch || bestMatch
  }

  /**
   * Find multiple candidates and select the best match with enhanced algorithm
   */
  findBestMatch(processedItem, processedPriceList, itemTokens, itemKeywords) {
    if (!processedItem || processedItem.trim().length === 0) {
      console.log('[LOCAL MATCH] Processed item is empty or null, returning null')
      return null
    }
    
    console.log(`[LOCAL MATCH] Finding best match for: "${processedItem}"`)
    console.log(`[LOCAL MATCH] Item tokens: [${itemTokens.join(', ')}]`)
    console.log(`[LOCAL MATCH] Item keywords: [${itemKeywords.join(', ')}]`)
    console.log(`[LOCAL MATCH] Searching through ${processedPriceList.length} price items`)
    
    const candidates = []
    
    // Calculate similarities for all price items
    for (const priceItem of processedPriceList) {
      if (!priceItem.processed_description) continue
      
      // Method 1: Levenshtein distance similarity
      const distance = levenshtein.get(processedItem, priceItem.processed_description)
      const maxLength = Math.max(processedItem.length, priceItem.processed_description.length)
      const similarity1 = maxLength > 0 ? 1 - (distance / maxLength) : 0
      
      // Method 2: Token-based Jaccard similarity (enhanced)
      const similarity2 = this.enhancedJaccardSimilarity(itemTokens, priceItem.tokens)
      
      // Method 3: Substring containment
      const similarity3 = this.containmentSimilarity(processedItem, priceItem.processed_description)
      
      // Method 4: Key terms matching (enhanced)
      const similarity4 = this.enhancedKeyTermsSimilarity(itemKeywords, priceItem.keywords)
      
      // Method 5: Exact phrase matching (bonus for exact phrases)
      const similarity5 = this.exactPhraseMatching(processedItem, priceItem.processed_description)
      
      // Method 6: Fuzzy token matching
      const similarity6 = this.fuzzyTokenMatching(itemTokens, priceItem.tokens)
      
      // Combine similarities with optimized weights
      const combinedSimilarity = 
        (similarity1 * 0.15) +  // Levenshtein (reduced weight)
        (similarity2 * 0.25) +  // Enhanced Jaccard (increased)
        (similarity3 * 0.15) +  // Containment
        (similarity4 * 0.20) +  // Enhanced key terms (increased)
        (similarity5 * 0.10) +  // Exact phrases
        (similarity6 * 0.15)    // Fuzzy matching (new)
      
      // Apply bonus for very high individual scores
      let bonusScore = combinedSimilarity
      if (similarity2 > 0.8 || similarity4 > 0.8 || similarity6 > 0.8) {
        bonusScore *= 1.1
      }
      
      // Determine primary method
      let primaryMethod = 'combined'
      const maxSim = Math.max(similarity1, similarity2, similarity3, similarity4, similarity5, similarity6)
      if (similarity2 === maxSim) primaryMethod = 'jaccard'
      else if (similarity3 === maxSim) primaryMethod = 'containment'
      else if (similarity4 === maxSim) primaryMethod = 'key_terms'
      else if (similarity5 === maxSim) primaryMethod = 'exact_phrase'
      else if (similarity6 === maxSim) primaryMethod = 'fuzzy_match'
      
      candidates.push({
        item: priceItem,
        confidence: Math.min(bonusScore, 1.0),
        method: primaryMethod,
        details: {
          levenshtein: similarity1,
          jaccard: similarity2,
          containment: similarity3,
          keyTerms: similarity4,
          exactPhrase: similarity5,
          fuzzyMatch: similarity6
        }
      })
    }
    
    // Sort candidates by confidence (highest first)
    candidates.sort((a, b) => b.confidence - a.confidence)
    
    // Take top 5 candidates for analysis
    const topCandidates = candidates.slice(0, 5)
    
    console.log(`[LOCAL MATCH] Top ${topCandidates.length} candidates:`)
    topCandidates.forEach((candidate, index) => {
      console.log(`  ${index + 1}. "${candidate.item.description?.substring(0, 50)}..." - Score: ${(candidate.confidence * 100).toFixed(2)}% (${candidate.method})`)
    })
    
    if (topCandidates.length === 0) {
      console.log('[LOCAL MATCH] No candidates found - creating a default match')
      // Always return a fallback match to ensure matchedCount is incremented
      if (processedPriceList.length > 0) {
        return {
          item: processedPriceList[0],
          confidence: 0.01,
          method: 'fallback',
          details: {
            levenshtein: 0,
            jaccard: 0,
            containment: 0,
            keyTerms: 0,
            exactPhrase: 0,
            fuzzyMatch: 0
          }
        }
      } else {
        // Even if no price list items, create a dummy match to prevent null returns
        console.warn('[LOCAL MATCH] No price list items available - creating dummy match')
        return {
          item: {
            id: 'dummy',
            description: 'No match found',
            rate: 0,
            unit: ''
          },
          confidence: 0.01,
          method: 'no_pricelist',
          details: {
            levenshtein: 0,
            jaccard: 0,
            containment: 0,
            keyTerms: 0,
            exactPhrase: 0,
            fuzzyMatch: 0
          }
        }
      }
    }
    
    // Apply additional selection criteria to choose the best among top candidates
    const bestCandidate = this.selectBestCandidate(topCandidates, processedItem)
    
    // If the best candidate has 0 confidence, give it at least 1%
    if (bestCandidate.confidence === 0) {
      bestCandidate.confidence = 0.01
    }
    
    console.log(`[LOCAL MATCH] Best candidate score: ${(bestCandidate.confidence * 100).toFixed(2)}%`)
    console.log(`[LOCAL MATCH] Always returning a match (minimum 1% confidence)`)
    
    // Always return the best match, even with very low confidence
    return bestCandidate
  }

  /**
   * Enhanced Jaccard similarity that considers synonyms
   */
  enhancedJaccardSimilarity(tokens1, tokens2) {
    if (!tokens1 || !tokens2 || tokens1.length === 0 || tokens2.length === 0) {
      return 0
    }
    
    // Expand tokens with synonyms
    const expandedTokens1 = new Set(tokens1)
    const expandedTokens2 = new Set(tokens2)
    
    tokens1.forEach(token => {
      if (this.synonymMap.has(token)) {
        expandedTokens1.add(this.synonymMap.get(token))
      }
    })
    
    tokens2.forEach(token => {
      if (this.synonymMap.has(token)) {
        expandedTokens2.add(this.synonymMap.get(token))
      }
    })
    
    const intersection = new Set([...expandedTokens1].filter(x => expandedTokens2.has(x)))
    const union = new Set([...expandedTokens1, ...expandedTokens2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  /**
   * Enhanced key terms similarity with weighted importance
   */
  enhancedKeyTermsSimilarity(keywords1, keywords2) {
    if (!keywords1 || !keywords2 || keywords1.length === 0 || keywords2.length === 0) {
      return 0
    }
    
    let matchScore = 0
    let totalWeight = 0
    
    // Weight different types of keywords differently
    keywords1.forEach(kw1 => {
      let weight = 1
      
      // Measurements are very important
      if (/\d+.*(?:mm|cm|m|inch|ft)/.test(kw1)) {
        weight = 3
      }
      // Material specs are important
      else if (/(?:grade|class|type|size)/.test(kw1)) {
        weight = 2
      }
      
      totalWeight += weight
      
      // Check for exact match or fuzzy match
      if (keywords2.includes(kw1)) {
        matchScore += weight
      } else {
        // Check for partial matches
        const partialMatch = keywords2.find(kw2 => 
          (kw1.includes(kw2) || kw2.includes(kw1)) && 
          Math.abs(kw1.length - kw2.length) <= 3
        )
        if (partialMatch) {
          matchScore += weight * 0.7
        }
      }
    })
    
    return totalWeight > 0 ? matchScore / totalWeight : 0
  }

  /**
   * Fuzzy token matching for handling typos and variations
   */
  fuzzyTokenMatching(tokens1, tokens2) {
    if (!tokens1 || !tokens2 || tokens1.length === 0 || tokens2.length === 0) {
      return 0
    }
    
    let matchCount = 0
    const maxPossibleMatches = Math.max(tokens1.length, tokens2.length)
    
    tokens1.forEach(token1 => {
      // Skip very short tokens
      if (token1.length < 3) return
      
      // Find best match in tokens2
      let bestMatch = 0
      tokens2.forEach(token2 => {
        if (token2.length < 3) return
        
        // Calculate similarity
        const distance = levenshtein.get(token1, token2)
        const maxLen = Math.max(token1.length, token2.length)
        const similarity = 1 - (distance / maxLen)
        
        // Consider it a match if similarity > 0.8 (80%)
        if (similarity > 0.8) {
          bestMatch = Math.max(bestMatch, similarity)
        }
      })
      
      matchCount += bestMatch
    })
    
    return maxPossibleMatches > 0 ? matchCount / maxPossibleMatches : 0
  }

  /**
   * Select the best candidate from top matches using additional criteria
   */
  selectBestCandidate(candidates, processedItem) {
    if (candidates.length === 1) {
      return candidates[0]
    }
    
    // Apply selection criteria
    let bestCandidate = candidates[0]
    let bestScore = this.calculateSelectionScore(candidates[0], processedItem)
    
    for (let i = 1; i < candidates.length; i++) {
      const candidate = candidates[i]
      const score = this.calculateSelectionScore(candidate, processedItem)
      
      if (score > bestScore) {
        bestScore = score
        bestCandidate = candidate
      }
    }
    
    return bestCandidate
  }

  /**
   * Calculate selection score considering multiple factors
   */
  calculateSelectionScore(candidate, processedItem) {
    let score = candidate.confidence
    
    // Bonus for high individual method scores
    if (candidate.details.exactPhrase > 0.7) score += 0.1
    if (candidate.details.keyTerms > 0.8) score += 0.05
    if (candidate.details.jaccard > 0.6) score += 0.05
    
    // Bonus for multiple high scores (indicates strong match across methods)
    const highScoreCount = Object.values(candidate.details)
      .filter(score => score > 0.5).length
    if (highScoreCount >= 3) score += 0.1
    
    // Penalty for very short descriptions (often generic)
    const itemDesc = candidate.item.description || candidate.item.full_context || ''
    if (itemDesc.length < 20) score -= 0.05
    
    // Bonus for reasonable description length (indicates specificity)
    if (itemDesc.length > 30 && itemDesc.length < 200) score += 0.03
    
    return score
  }

  /**
   * Exact phrase matching - bonus for matching exact phrases
   */
  exactPhraseMatching(text1, text2) {
    const words1 = text1.split(' ').filter(w => w.length > 2)
    const words2 = text2.split(' ').filter(w => w.length > 2)
    
    if (words1.length === 0 || words2.length === 0) return 0
    
    let exactMatches = 0
    const totalPhrases = Math.min(words1.length, words2.length)
    
    // Check for exact word matches
    for (const word1 of words1) {
      if (words2.includes(word1)) {
        exactMatches++
      }
    }
    
    // Check for 2-word phrase matches
    let phraseMatches = 0
    for (let i = 0; i < words1.length - 1; i++) {
      const phrase = `${words1[i]} ${words1[i + 1]}`
      const text2Lower = text2.toLowerCase()
      if (text2Lower.includes(phrase)) {
        phraseMatches++
      }
    }
    
    const wordScore = exactMatches / Math.max(words1.length, words2.length)
    const phraseScore = phraseMatches / Math.max(1, words1.length - 1)
    
    return (wordScore * 0.7) + (phraseScore * 0.3)
  }

  /**
   * Calculate containment similarity (how much of one text is contained in the other)
   */
  containmentSimilarity(text1, text2) {
    const tokens1 = text1.split(' ').filter(t => t.length > 0)
    const tokens2 = new Set(text2.split(' ').filter(t => t.length > 0))
    
    if (tokens1.length === 0) return 0
    
    const contained = tokens1.filter(token => tokens2.has(token)).length
    return contained / tokens1.length
  }

  /**
   * Generate output Excel file with matches using format preservation
   */
  async generateOutputExcel(matches, jobId, originalFileName) {
    try {
      // Import required services
      const { ExcelExportService } = await import('./ExcelExportService.js')
      const { createClient } = await import('@supabase/supabase-js')
      
      const exportService = new ExcelExportService()
      
      // Get Supabase client (same way as in CohereMatchingService)
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
      const supabase = createClient(process.env.SUPABASE_URL, supabaseKey)
      
      // Get the original input file path from the job
      const { data: jobData } = await supabase
        .from('ai_matching_jobs')
        .select('original_file_path, input_file_blob_key')
        .eq('id', jobId)
        .single()
      
      let originalFilePath = null
      
      // Try to get the original file
      if (jobData?.original_file_path && await fs.pathExists(jobData.original_file_path)) {
        originalFilePath = jobData.original_file_path
        console.log(`✅ [LOCAL] Found original file at: ${originalFilePath}`)
      } else if (jobData?.input_file_blob_key) {
        // Try to download from blob storage
        try {
          const VercelBlobService = (await import('./VercelBlobService.js')).default
          const blobData = await VercelBlobService.downloadFile(jobData.input_file_blob_key)
          
          // Save to temp directory
          const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'temp')
          if (!await fs.pathExists(tempDir)) {
            await fs.ensureDir(tempDir)
          }
          
          originalFilePath = path.join(tempDir, `local-original-${jobId}-${originalFileName}`)
          await fs.writeFile(originalFilePath, blobData.Body)
          console.log(`✅ [LOCAL] Downloaded original file from blob to: ${originalFilePath}`)
        } catch (blobError) {
          console.error('[LOCAL] Failed to download from blob:', blobError)
        }
      }
      
      // Use ExcelExportService with original format if available
      if (originalFilePath && await fs.pathExists(originalFilePath)) {
        console.log(`📄 [LOCAL] Using ExcelExportService with original format preservation`)
        const outputPath = await exportService.exportWithOriginalFormat(
          originalFilePath,
          matches,
          jobId,
          originalFileName
        )
        return outputPath
      } else {
        console.log(`📄 [LOCAL] Using basic Excel export (original file not available)`)
        const outputPath = await exportService.exportToExcel(
          matches,
          jobId,
          originalFileName
        )
        return outputPath
      }
    } catch (error) {
      console.error('❌ [LOCAL] Error generating output Excel:', error)
      throw error
    }
  }
} 