const { CohereClient } = require('cohere-ai');

class CohereEmbeddingService {
  constructor() {
    this.cohere = null;
    this.embeddings = new Map();
    this.EMBEDDING_BATCH_SIZE = 96;
    this.OUTPUT_DIMENSION = 1536;
  }

  async initialize(apiKey) {
    this.cohere = new CohereClient({
      token: apiKey,
    });
    console.log('Cohere Embedding Service initialized');
  }

  async precomputePriceListEmbeddings(priceItems) {
    console.log(`Precomputing embeddings for ${priceItems.length} price items...`);
    
    // Clear existing embeddings
    this.embeddings.clear();
    
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
        
        console.log(`Processed embeddings: ${i + batch.length}/${priceItems.length}`);
      } catch (error) {
        console.error('Error computing embeddings batch:', error);
      }
    }
    
    console.log(`Precomputed ${this.embeddings.size} embeddings`);
  }

  createSearchText(item) {
    // Combine all searchable fields into one text
    const parts = [
      item.item_number || '',
      item.description || '',
      item.unit || '',
      item.rate ? `${item.rate} rate` : '',
      item.category || '',
      item.subcategory || ''
    ].filter(part => part);
    
    return parts.join(' ').toLowerCase();
  }

  async matchItems(boqItems) {
    if (!this.cohere) {
      throw new Error('Cohere Embedding Service not initialized');
    }

    console.log(`Starting embedding-based matching for ${boqItems.length} items...`);
    const results = [];
    
    // Process in batches
    for (let i = 0; i < boqItems.length; i += this.EMBEDDING_BATCH_SIZE) {
      const batch = boqItems.slice(i, i + this.EMBEDDING_BATCH_SIZE);
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
          const bestMatch = this.findBestMatch(queryEmbedding, boqItem);
          
          results.push({
            boq_item_id: boqItem.id,
            price_item_id: bestMatch.id,
            confidence_score: bestMatch.confidence,
            match_reason: bestMatch.reason,
            source: 'cohere_embedding'
          });
        });
        
        console.log(`Processed batch ${i / this.EMBEDDING_BATCH_SIZE + 1}/${Math.ceil(boqItems.length / this.EMBEDDING_BATCH_SIZE)}`);
      } catch (error) {
        console.error('Error in embedding batch:', error);
        // Add fallback matches
        batch.forEach(boqItem => {
          results.push({
            boq_item_id: boqItem.id,
            price_item_id: null,
            confidence_score: 0,
            match_reason: 'Embedding error',
            source: 'cohere_embedding'
          });
        });
      }
    }
    
    return results;
  }

  createQueryText(boqItem) {
    // Create search query from BOQ item
    const parts = [
      boqItem.description || '',
      boqItem.unit || '',
      boqItem.section || ''
    ].filter(part => part);
    
    return parts.join(' ').toLowerCase();
  }

  findBestMatch(queryEmbedding, boqItem) {
    let bestMatch = null;
    let bestScore = -1;
    
    // Calculate cosine similarity with all price items
    for (const [priceItemId, data] of this.embeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
      
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = data.item;
      }
    }
    
    // Convert similarity to confidence percentage
    const confidence = Math.round(bestScore * 100);
    
    // Additional checks for unit matching
    let unitBonus = 0;
    if (bestMatch && boqItem.unit && bestMatch.unit) {
      const boqUnit = boqItem.unit.toLowerCase().trim();
      const priceUnit = bestMatch.unit.toLowerCase().trim();
      
      if (boqUnit === priceUnit) {
        unitBonus = 10;
      } else if (this.areUnitsCompatible(boqUnit, priceUnit)) {
        unitBonus = 5;
      }
    }
    
    return {
      id: bestMatch?.id || null,
      confidence: Math.min(confidence + unitBonus, 100),
      reason: `Semantic similarity: ${confidence}%${unitBonus > 0 ? `, Unit match: +${unitBonus}%` : ''}`
    };
  }

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

  areUnitsCompatible(unit1, unit2) {
    const unitMap = {
      'm': ['meter', 'meters', 'metre', 'metres', 'mtr', 'mtrs'],
      'm2': ['sqm', 'sq.m', 'sq m', 'square meter', 'square meters', 'm²'],
      'm3': ['cum', 'cu.m', 'cu m', 'cubic meter', 'cubic meters', 'm³'],
      'kg': ['kilogram', 'kilograms', 'kgs'],
      'no': ['nos', 'number', 'numbers', 'pcs', 'pieces', 'each', 'ea'],
      'ton': ['tons', 'tonne', 'tonnes', 'mt'],
      'lm': ['linear meter', 'linear meters', 'lin.m', 'l.m'],
      'ls': ['lump sum', 'lumpsum', 'lot'],
      'hr': ['hour', 'hours', 'hrs'],
      'day': ['days'],
      'month': ['months', 'mon'],
      'week': ['weeks', 'wk']
    };
    
    // Check if both units belong to the same group
    for (const [standard, variations] of Object.entries(unitMap)) {
      const group = [standard, ...variations];
      if (group.includes(unit1) && group.includes(unit2)) {
        return true;
      }
    }
    
    return false;
  }
}

module.exports = CohereEmbeddingService; 