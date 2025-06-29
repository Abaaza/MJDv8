# AI Price Matching Models Documentation

## Overview
The MJDv8 price matching system employs 5 distinct AI models to match construction items from Excel files against a master price list. Each model uses different techniques and algorithms to provide varying levels of accuracy and performance.

## Model Architecture

### 1. 🧠 COHERE Model (Cohere AI)
**Type:** Advanced Neural Network with Embeddings  
**API:** Cohere API  
**Location:** `server/services/CohereMatchingService.js`

#### How it Works:
- **Embedding Generation**: Uses Cohere's `embed-english-v3.0` model to generate 1024-dimensional vector embeddings
- **Semantic Understanding**: Converts text descriptions into numerical representations that capture semantic meaning
- **Similarity Calculation**: Computes cosine similarity between item embeddings and price list embeddings
- **Batch Processing**: Processes items in batches of 96 for API efficiency

#### Key Features:
```javascript
// Embedding generation
const response = await cohere.embed({
  texts: descriptions,
  model: 'embed-english-v3.0',
  inputType: 'search_document'
});

// Similarity computation
const similarity = this.cosineSimilarity(itemEmbedding, priceEmbedding);
```

#### Strengths:
- Superior semantic understanding (understands "timber" ≈ "wood")
- Handles variations in terminology well
- Best for complex, technical descriptions
- Language-agnostic capabilities

#### Weaknesses:
- Requires API calls (network dependency)
- Higher latency due to external processing
- API rate limits and costs
- Maximum 96 items per batch

### 2. 🤖 OPENAI Model (GPT-based)
**Type:** GPT-3.5/4 Language Model  
**API:** OpenAI API  
**Location:** `server/services/OpenAIMatchingService.js`

#### How it Works:
- **Text Embedding**: Uses OpenAI's text-embedding models to create vector representations
- **Contextual Analysis**: Leverages GPT's understanding of context and relationships
- **Similarity Scoring**: Calculates embedding distances to find best matches
- **Smart Fallbacks**: Can use GPT for direct text analysis when embeddings fail

#### Key Features:
```javascript
// OpenAI embedding generation
const embedding = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: description
});

// Alternative: Direct GPT analysis
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [/* context + item description */]
});
```

#### Strengths:
- Excellent contextual understanding
- Can handle ambiguous descriptions
- Good with abbreviations and industry jargon
- Flexible matching strategies

#### Weaknesses:
- API costs can be significant
- Rate limiting concerns
- Network latency
- Token limits for batch processing

### 3. 💻 LOCAL Model (Fuzzy String Matching)
**Type:** Algorithmic String Matching  
**API:** None (runs locally)  
**Location:** `server/services/LocalMatchingService.js`

#### How it Works:
- **Fuzzy String Matching**: Uses Levenshtein distance and other string similarity algorithms
- **N-gram Analysis**: Breaks text into chunks for partial matching
- **Token-based Matching**: Splits descriptions into words/tokens for comparison
- **Weighted Scoring**: Combines multiple similarity metrics

#### Key Features:
```javascript
// Fuzzy matching implementation
const fuzzScore = fuzzball.ratio(item.description, priceItem.description);
const tokenScore = fuzzball.token_set_ratio(item.description, priceItem.description);
const partialScore = fuzzball.partial_ratio(item.description, priceItem.description);

// Combined scoring
const finalScore = (fuzzScore * 0.4) + (tokenScore * 0.4) + (partialScore * 0.2);
```

#### Strengths:
- No API dependencies (fully offline)
- Zero latency (instant processing)
- No usage costs
- Handles typos and misspellings well
- Predictable performance

#### Weaknesses:
- No semantic understanding ("wood" ≠ "timber")
- Limited to surface-level text similarity
- Struggles with synonyms and variations
- Less accurate for complex descriptions

### 4. 🌟 HYBRID Model (Multi-Strategy Approach)
**Type:** Combined AI + Algorithmic  
**API:** Multiple (Cohere + Local)  
**Location:** `server/services/HybridMatchingService.js`

#### How it Works:
- **Multi-Stage Pipeline**: Combines embeddings with fuzzy matching
- **Confidence Scoring**: Uses multiple models and weights results
- **Fallback Strategy**: If one method fails, others compensate
- **Ensemble Approach**: Aggregates results from different techniques

#### Key Features:
```javascript
// Stage 1: Quick fuzzy match
const fuzzyResults = await this.fuzzyMatch(item, priceList);

// Stage 2: Embedding refinement for uncertain matches
if (fuzzyResults.confidence < 0.8) {
  const embeddingResults = await this.embeddingMatch(item, candidates);
  results = this.mergeResults(fuzzyResults, embeddingResults);
}

// Stage 3: Validation and ranking
const finalResults = this.validateAndRank(results);
```

#### Strengths:
- Best of both worlds (semantic + syntactic)
- Robust fallback mechanisms
- Balanced speed and accuracy
- Handles edge cases well

#### Weaknesses:
- More complex implementation
- Harder to debug and optimize
- Still requires API for best results
- Processing overhead from multiple methods

### 5. ⚡ ADVANCED Model (Enhanced Local Processing)
**Type:** Advanced Algorithmic with ML Features  
**API:** None (runs locally)  
**Location:** `server/services/AdvancedMatchingService.js`

#### How it Works:
- **TF-IDF Vectorization**: Term frequency-inverse document frequency for importance weighting
- **Advanced Tokenization**: Smart text preprocessing and normalization
- **Category-Aware Matching**: Uses category information to improve accuracy
- **Custom Scoring Algorithm**: Domain-specific similarity metrics

#### Key Features:
```javascript
// TF-IDF implementation
const tfidfVectors = this.calculateTFIDF(priceList);
const itemVector = this.vectorizeItem(item);

// Category boost
if (item.category === priceItem.category) {
  score *= 1.2; // 20% boost for matching categories
}

// Advanced text processing
const normalizedText = this.normalize(text)
  .toLowerCase()
  .replace(/[^\w\s]/g, '')
  .split(/\s+/)
  .filter(token => !stopWords.includes(token));
```

#### Strengths:
- No external dependencies
- Fast processing
- Category-aware matching
- Optimized for construction industry terms
- Consistent performance

#### Weaknesses:
- Limited semantic understanding
- Requires good text preprocessing
- May miss non-obvious matches
- Performance depends on data quality

## Performance Comparison

| Model | Speed | Accuracy | Cost | Offline | Best Use Case |
|-------|-------|----------|------|---------|---------------|
| COHERE | Medium | High (90%+) | $$$ | No | Complex technical descriptions |
| OPENAI | Medium | High (88%+) | $$$$ | No | Ambiguous or contextual items |
| LOCAL | Fast | Medium (70%) | Free | Yes | Simple, well-structured data |
| HYBRID | Slow | Very High (92%+) | $$ | Partial | Mission-critical matching |
| ADVANCED | Fast | Good (80%) | Free | Yes | Large batches, good data quality |

## Improvement Opportunities

### 1. **Caching Layer**
```javascript
// Implement embedding cache
const embeddingCache = new Map();
const getCachedEmbedding = async (text) => {
  const hash = crypto.createHash('md5').update(text).digest('hex');
  if (embeddingCache.has(hash)) {
    return embeddingCache.get(hash);
  }
  const embedding = await generateEmbedding(text);
  embeddingCache.set(hash, embedding);
  return embedding;
};
```

### 2. **Pre-computed Embeddings**
- Generate and store embeddings for the entire price list
- Update only when price list changes
- Dramatic speed improvement for API-based models

### 3. **Smart Model Selection**
```javascript
// Automatically choose best model based on input
const selectModel = (item, context) => {
  if (item.description.length < 20) return 'LOCAL';
  if (item.category && context.categoryAccuracy > 0.9) return 'ADVANCED';
  if (context.requireHighAccuracy) return 'HYBRID';
  return 'COHERE';
};
```

### 4. **Parallel Processing**
- Process different batches with different models simultaneously
- Aggregate results for better accuracy
- Implement worker threads for CPU-intensive operations

### 5. **Machine Learning Enhancements**
```javascript
// Train a lightweight ML model on successful matches
const trainCustomModel = async (historicalMatches) => {
  const features = extractFeatures(historicalMatches);
  const model = await tf.sequential({
    layers: [
      tf.layers.dense({ units: 64, activation: 'relu' }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' })
    ]
  });
  // Train on historical data
  return model;
};
```

### 6. **Hybrid Caching Strategy**
- Cache full results for common queries
- Cache partial results (embeddings) for components
- Implement smart cache invalidation

### 7. **Enhanced Preprocessing**
```javascript
// Industry-specific text normalization
const enhancedNormalize = (text) => {
  return text
    .replace(/\b(\d+)mm\b/gi, '$1 millimeter')
    .replace(/\b(\d+)m\b/gi, '$1 meter')
    .replace(/\bgalv\b/gi, 'galvanized')
    .replace(/\bconc\b/gi, 'concrete')
    // Add more industry-specific replacements
};
```

### 8. **Confidence Calibration**
- Implement confidence score calibration based on historical accuracy
- Use ensemble methods to improve confidence estimates
- Add uncertainty quantification

### 9. **Active Learning**
- Track user corrections to matches
- Retrain or fine-tune models based on feedback
- Implement a feedback loop for continuous improvement

### 10. **Category-Specific Models**
```javascript
// Specialized models for different categories
const categoryModels = {
  'electrical': new ElectricalMatcher(),
  'plumbing': new PlumbingMatcher(),
  'structural': new StructuralMatcher()
};

const match = async (item) => {
  const specializedModel = categoryModels[item.category];
  if (specializedModel) {
    return specializedModel.match(item);
  }
  return defaultModel.match(item);
};
```

## Implementation Best Practices

1. **Always provide fallbacks** - If API models fail, fall back to local models
2. **Implement rate limiting** - Protect against API quota exhaustion
3. **Use batch processing** - Minimize API calls by batching items
4. **Monitor performance** - Track accuracy and speed metrics
5. **Implement circuit breakers** - Prevent cascade failures
6. **Cache aggressively** - Reduce redundant API calls
7. **Preprocess consistently** - Ensure data quality before matching
8. **Log everything** - Maintain detailed logs for debugging and improvement

## Conclusion

The 5-model architecture provides flexibility and robustness for price matching. Each model has its strengths and ideal use cases. The key to optimization is:

1. Understanding your data characteristics
2. Choosing the right model for each scenario
3. Implementing smart caching and preprocessing
4. Continuously monitoring and improving based on results

For maximum effectiveness, consider implementing a dynamic model selection system that chooses the optimal model based on:
- Item characteristics (length, complexity, category)
- Current system load
- Required accuracy level
- Cost constraints
- Network availability