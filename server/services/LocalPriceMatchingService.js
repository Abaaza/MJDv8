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
    
    // Enhanced construction terms and their normalized forms
    this.synonymMap = new Map([
      // Building materials
      ['bricks', 'brick'], ['brickwork', 'brick'], ['blocks', 'brick'], ['blockwork', 'brick'],
      ['masonry', 'brick'], ['stonework', 'stone'], ['tiles', 'tile'], ['tiling', 'tile'],
      ['pavers', 'paver'], ['paving', 'paver'], ['slabs', 'slab'], ['flagstone', 'stone'],
      
      // Concrete and cement
      ['cement', 'concrete'], ['mortar', 'concrete'], ['grout', 'concrete'],
      ['screed', 'concrete'], ['render', 'concrete'], ['plaster', 'plaster'],
      ['stucco', 'plaster'], ['skim', 'plaster'], ['float', 'plaster'],
      
      // Foundation work
      ['footing', 'foundation'], ['footings', 'foundation'], ['foundations', 'foundation'],
      ['basement', 'foundation'], ['substructure', 'foundation'], ['base', 'foundation'],
      ['slab', 'foundation'], ['raft', 'foundation'], ['pile', 'foundation'],
      
      // Excavation and earthwork
      ['excavation', 'excavate'], ['excavations', 'excavate'], ['dig', 'excavate'], 
      ['digging', 'excavate'], ['earthwork', 'excavate'], ['trenching', 'excavate'],
      ['backfill', 'fill'], ['backfilling', 'fill'], ['filling', 'fill'],
      
      // Installation and construction
      ['installation', 'install'], ['installing', 'install'], ['installed', 'install'],
      ['construction', 'build'], ['building', 'build'], ['erection', 'install'],
      ['assembly', 'install'], ['fitting', 'install'], ['fix', 'install'],
      ['fixing', 'install'], ['mount', 'install'], ['mounting', 'install'],
      
      // Demolition and removal
      ['demolition', 'demolish'], ['demolishing', 'demolish'], ['remove', 'demolish'],
      ['removal', 'demolish'], ['strip', 'demolish'], ['break', 'demolish'],
      ['dismantle', 'demolish'], ['dismantling', 'demolish'],
      
      // Supply and provision
      ['supply', 'provide'], ['supplies', 'provide'], ['providing', 'provide'],
      ['furnish', 'provide'], ['deliver', 'provide'], ['procurement', 'provide'],
      ['supplier', 'provide'], ['provision', 'provide'],
      
      // Finishes
      ['painting', 'paint'], ['plastering', 'plaster'], ['flooring', 'floor'],
      ['roofing', 'roof'], ['cladding', 'clad'], ['insulation', 'insulate'],
      ['waterproofing', 'waterproof'], ['damp', 'waterproof'], ['dampproof', 'waterproof'],
      
      // MEP (Mechanical, Electrical, Plumbing)
      ['electrical', 'electric'], ['plumbing', 'plumb'], ['hvac', 'ventilation'],
      ['heating', 'heat'], ['cooling', 'cool'], ['ventilation', 'ventilate'],
      ['mechanical', 'mechanic'], ['sanitary', 'plumb'], ['drainage', 'drain'],
      
      // Structural
      ['reinforcement', 'reinforce'], ['steelwork', 'steel'], ['formwork', 'form'],
      ['shuttering', 'shutter'], ['framework', 'frame'], ['structural', 'structure'],
      ['beam', 'beam'], ['column', 'column'], ['girder', 'beam'],
      
      // Doors and windows
      ['door', 'door'], ['doors', 'door'], ['window', 'window'], ['windows', 'window'],
      ['glazing', 'glass'], ['glazed', 'glass'], ['frame', 'frame'], ['frames', 'frame'],
      
      // Common materials
      ['timber', 'wood'], ['lumber', 'wood'], ['steel', 'metal'], ['iron', 'metal'],
      ['aluminum', 'metal'], ['aluminium', 'metal'], ['copper', 'metal']
    ])
    
    // Stop words to remove from descriptions
    this.stopWords = new Set([
      'the', 'and', 'of', 'to', 'in', 'for', 'on', 'at', 'by', 'from', 'with',
      'a', 'an', 'be', 'is', 'are', 'as', 'it', 'its', 'into', 'or', 'this',
      'that', 'will', 'shall', 'would', 'could', 'should', 'may', 'might',
      'per', 'each', 'all', 'any', 'some', 'no', 'not', 'only', 'such',
      'than', 'too', 'very', 'can', 'had', 'her', 'was', 'one', 'our', 'out',
      'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
      'see', 'two', 'way', 'who', 'boy', 'did', 'use', 'she', 'they', 'we'
    ])
  }

  /**
   * Main function to match items against price list
   */
  async matchItems(items, priceList, jobId, originalFileName, updateJobStatus) {
    try {
      console.log(`🔍 Starting local price matching...`)
      console.log(`📋 Items to match: ${items.length}`)
      console.log(`💰 Price list entries: ${priceList.length}`)
      
      // Preprocess price list descriptions with enhanced processing
      const processedPriceList = priceList.map(item => ({
        ...item,
        processed_description: this.preprocessDescription(item.description || item.full_context),
        tokens: this.tokenizeDescription(item.description || item.full_context),
        keywords: this.extractKeywords(item.description || item.full_context)
      }))
      
      const matches = []
      let matchedCount = 0
      let totalConfidence = 0
      
      // Process each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const processedItem = this.preprocessDescription(item.description)
        const itemTokens = this.tokenizeDescription(item.description)
        const itemKeywords = this.extractKeywords(item.description)
        
        if (i % 50 === 0) {
          console.log(`📊 Processing item ${i + 1}/${items.length}`)
  
      // Update progress
      if (i % 10 === 0 || i === items.length - 1) {
        const progress = 40 + Math.round((i / items.length) * 40)
        await this.updateJobStatus(jobId, 'processing', progress, `Local Matching: ${i + 1}/${items.length} items (${matchedCount} matches)`, {
          total_items: items.length,
          matched_items: matchedCount
        })
      }
      }
        
        // Find best match with enhanced algorithm
        const match = this.findBestMatch(processedItem, processedPriceList, itemTokens, itemKeywords)
        
        if (match && match.confidence >= 0.25) { // Lower threshold to 25%
          const matchResult = {
            id: `match_${Date.now()}_${i}`,
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
          
          console.log(`✅ Match found: "${item.description.substring(0, 40)}..." -> "${match.item.description?.substring(0, 40)}..." (${Math.round(match.confidence * 100)}%)`)
        } else {
          console.log(`❌ No match: "${item.description.substring(0, 40)}..." (best: ${match ? Math.round(match.confidence * 100) : 0}%)`)
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
    
    // Remove special characters but keep spaces
    processed = processed.replace(/[^\w\s]/g, ' ')
    
    // Normalize units and measurements (replace with generic tokens)
    processed = processed.replace(/\b\d+(?:\.\d+)?\s*(mm|cm|m|inch|in|ft|feet|yard|yd|m2|m3|sqm|cum)\b/g, ' UNIT ')
    
    // Normalize numbers
    processed = processed.replace(/\b\d+(?:\.\d+)?\b/g, ' NUM ')
    
    // Tokenize
    const tokens = this.tokenizer.tokenize(processed) || []
    
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
    
    return processedTokens.join(' ')
  }

  /**
   * Extract important keywords from description
   */
  extractKeywords(description) {
    if (!description) return []
    
    const tokens = this.tokenizeDescription(description)
    const keywords = []
    
    // Extract measurements
    const measurements = description.match(/\b\d+(?:\.\d+)?\s*(?:mm|cm|m|inch|in|ft|feet|yard|yd|m2|m3|sqm|cum)\b/gi) || []
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
   * Find multiple candidates and select the best match with enhanced algorithm
   */
  findBestMatch(processedItem, processedPriceList, itemTokens, itemKeywords) {
    if (!processedItem || processedItem.trim().length === 0) {
      return null
    }
    
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
    
    if (topCandidates.length === 0) {
      return null
    }
    
    // Apply additional selection criteria to choose the best among top candidates
    const bestCandidate = this.selectBestCandidate(topCandidates, processedItem)
    
    return bestCandidate.confidence >= 0.2 ? bestCandidate : null
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
   * Generate output Excel file with matches
   */
  async generateOutputExcel(matches, jobId, originalFileName) {
    try {
      const outputPath = path.join(this.outputDir, `processed-${jobId}-${originalFileName}`)
      
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Results')
      
      // Define headers
      const headers = [
        'original_description',
        'matched_description',
        'matched_rate',
        'similarity_score',
        'quantity',
        'unit',
        'total_amount',
        'matched_price_item_id',
        'row_number',
        'sheet_name',
        'match_method',
        'section_header'
      ]
      
      // Add headers with formatting
      const headerRow = worksheet.addRow(headers)
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'CCE5FF' }
        }
      })
      
      // Add data rows
      matches.forEach(match => {
        worksheet.addRow([
          match.original_description,
          match.matched_description,
          match.matched_rate,
          match.similarity_score,
          match.quantity,
          match.unit,
          match.total_amount,
          match.matched_price_item_id,
          match.row_number,
          match.sheet_name,
          match.match_method,
          match.section_header
        ])
      })
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = Math.min(maxLength + 2, 50)
      })
      
      // Save workbook
      await workbook.xlsx.writeFile(outputPath)
      
      console.log(`💾 Generated output file: ${outputPath}`)
      return outputPath
      
    } catch (error) {
      console.error(`❌ Error generating output Excel:`, error)
      throw error
    }
  }
} 