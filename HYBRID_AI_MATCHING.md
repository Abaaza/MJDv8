# Hybrid AI Matching System

This document explains the enhanced hybrid AI matching feature that combines OpenAI's text-embedding-3-large model with Cohere's embed-multilingual-v3.0 for superior price matching accuracy.

## Overview

The hybrid matching system is now the **default matching method** and runs both AI models in parallel, intelligently combining their results to provide:

- **Higher accuracy**: Leverages strengths of both models
- **Better confidence**: Agreement between models significantly boosts confidence scores
- **Guaranteed matches**: Always returns a match, even with low confidence
- **Smart decision making**: Uses multiple factors to choose the best match

## Key Features

### 1. Default Matching Method

- No need to select matching method - hybrid AI is automatically used
- Fallback to single AI model if one API key is not configured
- Further fallback to local matching if no AI services are available

### 2. API Key Management

- Both Cohere and OpenAI API keys are managed through Admin Settings
- No need to modify environment variables
- Keys are securely stored in the database

### 3. Always Returns Matches

- Even with very low confidence (minimum 1%)
- Ensures all items get processed
- Allows for manual review of low-confidence matches

## How It Works

### 1. Pre-computation Phase

Both services pre-compute embeddings for all price list items:

- **OpenAI**: text-embedding-3-large (3072 dimensions)
- **Cohere**: embed-multilingual-v3.0 (1024 dimensions)
- Embeddings are categorized for faster, more accurate matching

### 2. Matching Phase

For each BOQ item:

- Both services generate embeddings and find best matches
- Results are intelligently combined based on multiple factors

### 3. Smart Result Combination

#### When Both Models Agree (Same Item Match):

- **Confidence Boost**: +20% for agreement
- **High Trust**: This indicates a very reliable match
- **Example**: If both match with 70% confidence → Final: 90%

#### When Models Disagree (Different Items):

The system uses a weighted scoring algorithm:

```javascript
// Base score = confidence from each model
let cohereScore = cohereMatch.confidence;
let openaiScore = openaiMatch.confidence;

// Unit matching bonus (+10%)
if (match.unit === boq.unit) score += 0.1;

// Description word overlap bonus (+5% per matching word)
const matchingWords = countMatchingWords(boq.description, match.description);
score += matchingWords * 0.05;

// Select the match with higher total score
```

#### When Only One Model Finds a Match:

- **Confidence Adjustment**: -10% penalty for single-model match
- **Still Accepted**: The match is used but with slightly lower confidence
- **Transparency**: System tracks which model provided the match

## Performance Enhancements

### 1. Category-Based Matching

The system automatically identifies categories from:

- Section headers (90% confidence)
- Sheet names (70% confidence)
- Item descriptions (50-80% confidence)

Categories include:

- Excavation & Earthwork
- Concrete & Masonry
- Steel & Reinforcement
- Finishing Works
- Plumbing & Drainage
- Electrical Works
- And more...

### 2. Parallel Processing

- Both AI models run simultaneously
- Pre-computation of embeddings for faster matching
- Batch processing for efficiency

### 3. Smart Caching

- Price list embeddings cached for 5 minutes
- Reduces API calls for multiple jobs
- Improves response time

## Setup Instructions

### 1. Configure API Keys in Admin Settings

1. Go to Settings → Admin Settings
2. Enter your Cohere API key (get from https://cohere.ai)
3. Enter your OpenAI API key (get from https://platform.openai.com)
4. Click "Update API Keys"

### 2. Start Matching

1. Go to Price Matcher
2. Upload your BOQ Excel file
3. Enter project name and client
4. Click "Start AI Matching"
5. The system automatically uses hybrid matching

## Understanding Results

### Match Confidence Levels

- **90-100%**: Excellent match (often indicates model agreement)
- **70-89%**: Good match (high confidence from at least one model)
- **50-69%**: Fair match (may need review)
- **Below 50%**: Low confidence (manual review recommended)

### Match Methods in Results

- `hybrid_agreement`: Both models matched the same item
- `hybrid_cohere_selected`: Cohere's match was chosen after comparison
- `hybrid_openai_selected`: OpenAI's match was chosen after comparison
- `cohere_only`: Only Cohere found a match
- `openai_only`: Only OpenAI found a match

## Tips for Best Results

### 1. Price List Quality

- Ensure descriptions are detailed and clear
- Include units, specifications, and categories
- Use consistent terminology

### 2. BOQ Preparation

- Keep original formatting and structure
- Include section headers for context
- Maintain clear item descriptions

### 3. Review Low-Confidence Matches

- Items below 70% confidence should be reviewed
- Check if the matched unit makes sense
- Verify rates are reasonable

## Cost Optimization

### API Usage

- **Cohere**: $0.10 per 1,000 embeddings
- **OpenAI**: $0.13 per 1,000 embeddings
- **Combined**: ~$0.23 per 1,000 items

### Cost-Saving Tips

1. Process multiple BOQs together (uses cached embeddings)
2. Clean your price list to remove duplicates
3. Consider using local matching for simple projects

## Troubleshooting

### No Matches Found

- Check API keys are correctly configured
- Verify price list has items with descriptions
- Ensure BOQ has quantity columns

### Low Confidence Across All Items

- Review price list descriptions - are they too brief?
- Check if BOQ uses different terminology
- Consider adding more context to price items

### API Errors

- Verify API keys in Admin Settings
- Check you have credits/billing enabled
- Monitor rate limits (both services have generous limits)

## Advanced Features

### Hybrid Match Details

Each match includes detailed information:

```json
{
  "match_method": "hybrid_agreement",
  "hybrid_details": {
    "cohere_confidence": 0.82,
    "openai_confidence": 0.85,
    "agreement": true,
    "boost_applied": 0.2
  }
}
```

This allows you to:

- Understand why a match was chosen
- See individual model confidences
- Track model agreement rates
- Optimize your price lists based on patterns
