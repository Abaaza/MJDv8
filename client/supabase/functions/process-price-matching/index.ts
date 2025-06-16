
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Import XLSX library that works in Deno
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessRequest {
  jobId: string
  fileName: string
  fileData: string // base64 encoded
}

interface PriceItem {
  id: string
  description: string
  rate: number
  full_context: string
}

interface ExcelItem {
  description: string
  row: number
  sheet: string
  quantity?: number
  isValidItem?: boolean
  confidence?: number
}

// Text preprocessing functions
const SYNONYM_MAP: Record<string, string> = {
  "bricks": "brick",
  "brickwork": "brick", 
  "blocks": "brick",
  "blockwork": "brick",
  "cement": "concrete",
  "concrete": "concrete",
  "footing": "foundation",
  "footings": "foundation",
  "excavation": "excavate",
  "excavations": "excavate",
  "excavate": "excavate",
  "dig": "excavate",
  "installation": "install",
  "installing": "install",
  "installed": "install",
  "demolition": "demolish",
  "demolish": "demolish",
  "demolishing": "demolish",
  "remove": "demolish",
  "supply": "provide",
  "supplies": "provide",
  "providing": "provide",
}

const STOP_WORDS = new Set([
  "the","and","of","to","in","for","on","at","by","from","with",
  "a","an","be","is","are","as","it","its","into","or",
])

function applySynonyms(text: string): string {
  const parts = []
  for (const word of text.split(' ')) {
    let w = SYNONYM_MAP[word] || word
    if (w.length > 3) {
      w = w.replace(/(ings|ing|ed|es|s)$/, "")
    }
    parts.push(w)
  }
  return parts.join(' ')
}

function removeStopWords(text: string): string {
  return text.split(' ')
    .filter(w => w && !STOP_WORDS.has(w))
    .join(' ')
}

function preprocessText(s: string): string {
  if (!s) return ""
  
  s = String(s).toLowerCase()
  s = s.replace(/[^a-z0-9\s]/g, " ")
  s = s.replace(/\b\d+(?:\.\d+)?\b/g, " ")
  s = s.replace(/\s+(mm|cm|m|inch|in|ft)\b/g, " ")
  s = s.replace(/\s+/g, " ").trim()
  s = applySynonyms(s)
  s = removeStopWords(s)
  
  return s
}

// Parse Excel file using XLSX library - simplified for 2-column format
async function parseExcelData(base64Data: string): Promise<ExcelItem[]> {
  console.log('Starting Excel parsing for simple 2-column format...')
  const candidateItems: ExcelItem[] = []
  
  try {
    console.log(`Parsing Excel file of ${atob(base64Data).length} bytes`)
    
    // Decode the base64 data to binary
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    console.log('Converting binary data to workbook...')
    
    // Parse the Excel file using XLSX
    const workbook = XLSX.read(bytes, { type: 'array' })
    
    console.log(`Found ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}`)
    
    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      console.log(`Processing sheet: ${sheetName}`)
      
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert sheet to JSON array
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, // Use array format
        defval: '', // Default value for empty cells
        raw: false // Convert everything to strings
      }) as string[][]
      
      console.log(`Sheet ${sheetName} has ${jsonData.length} rows`)
      
      // Process each row (skip header row)
      jsonData.forEach((row, rowIndex) => {
        if (rowIndex === 0) return // Skip header row
        
        // Expect description in first column, quantity in second column
        const description = row[0]
        const quantity = row[1] ? parseFloat(row[1]) : undefined
        
        if (description && typeof description === 'string' && description.trim().length > 0) {
          const desc = description.trim()
          
          // Basic filtering to identify valid items
          if (desc.length >= 5 && // Minimum length
              desc.length <= 500 && // Maximum length
              !/^[\d\.\,\s]+$/.test(desc) && // Not just numbers
              !/^[A-Z]{1,5}\d+$/.test(desc)) { // Not just codes like "A123"
            
            candidateItems.push({
              description: desc,
              row: rowIndex + 1,
              sheet: sheetName,
              quantity: quantity,
              isValidItem: true,
              confidence: 0.9
            })
          }
        }
      })
    }
    
    console.log(`Extracted ${candidateItems.length} items from Excel file`)
    
    if (candidateItems.length === 0) {
      throw new Error('No valid items found in Excel file. Please ensure your file has descriptions in the first column.')
    }
    
    return candidateItems
    
  } catch (error) {
    console.error('Error parsing Excel data:', error)
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure you uploaded a valid Excel file (.xlsx or .xls).`)
  }
}

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Jaccard similarity for token overlap
function jaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(text1.match(/\b[a-zA-Z0-9]+\b/g) || [])
  const tokens2 = new Set(text2.match(/\b[a-zA-Z0-9]+\b/g) || [])
  
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)))
  const union = new Set([...tokens1, ...tokens2])
  
  return union.size === 0 ? 0 : intersection.size / union.size
}

// Optimized batch processing for Cohere API
async function getEmbeddingsBatch(cohereApiKey: string, texts: string[], inputType: string = "search_document"): Promise<number[][]> {
  const BATCH_SIZE = 50
  const allEmbeddings: number[][] = []
  
  console.log(`Processing ${texts.length} texts in batches of ${BATCH_SIZE} for ${inputType}`)
  
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(texts.length / BATCH_SIZE)
    
    console.log(`Requesting Cohere embeddings batch ${batchNumber}/${totalBatches} (${batch.length} texts)`)
    
    const response = await fetch('https://api.cohere.com/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: batch,
        model: 'embed-english-v3.0',
        input_type: inputType,
        embedding_types: ['float']
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cohere API error response:', errorText)
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.embeddings && data.embeddings.float) {
      console.log(`Adding ${data.embeddings.float.length} embeddings from batch ${batchNumber}`)
      allEmbeddings.push(...data.embeddings.float)
    } else {
      console.error('Unexpected Cohere API response format:', data)
      throw new Error('Unexpected embeddings response format from Cohere API')
    }
    
    // Small delay between requests
    if (i + BATCH_SIZE < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  console.log(`Completed processing all batches. Total embeddings: ${allEmbeddings.length}`)
  return allEmbeddings
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let requestBody: ProcessRequest
  let jobId: string | null = null

  try {
    requestBody = await req.json() as ProcessRequest
    jobId = requestBody.jobId

    console.log('Processing request for job:', jobId)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get Cohere API key from admin settings
    console.log('Fetching Cohere API key from admin settings...')
    const { data: settingsData, error: settingsError } = await supabase
      .from('app_settings')
      .select('cohere_api_key')
      .limit(1)
      .single()

    if (settingsError || !settingsData?.cohere_api_key) {
      throw new Error('Cohere API key not found in admin settings. Please configure it in the admin panel.')
    }

    const cohereApiKey = settingsData.cohere_api_key
    console.log('Cohere API key found in settings')

    // Update job status to processing
    await supabase
      .from('ai_matching_jobs')
      .update({ 
        status: 'processing',
        progress: 10
      })
      .eq('id', jobId)

    // Load price items
    console.log('Loading price items from database...')
    const { data: allPriceItems, error: priceError } = await supabase
      .from('price_items')
      .select('id, description, rate, full_context')
      .not('rate', 'is', null)
      .not('full_context', 'is', null)

    if (priceError) {
      throw new Error(`Failed to load price list: ${priceError.message}`)
    }

    if (!allPriceItems || allPriceItems.length === 0) {
      throw new Error('No price items found in database')
    }

    console.log(`Total price items loaded: ${allPriceItems.length}`)

    await supabase
      .from('ai_matching_jobs')
      .update({ progress: 20 })
      .eq('id', jobId)

    // Parse Excel file
    console.log('Parsing Excel file...')
    const excelItems = await parseExcelData(requestBody.fileData)
    console.log(`Extracted ${excelItems.length} items from Excel file`)

    if (excelItems.length === 0) {
      throw new Error('No valid items found in Excel file.')
    }

    await supabase
      .from('ai_matching_jobs')
      .update({ 
        progress: 30,
        total_items: excelItems.length
      })
      .eq('id', jobId)

    // Preprocess descriptions
    console.log('Preprocessing descriptions...')
    const priceDescriptions = allPriceItems.map(item => preprocessText(item.full_context || item.description))
    const inquiryDescriptions = excelItems.map(item => preprocessText(item.description))

    await supabase
      .from('ai_matching_jobs')
      .update({ progress: 40 })
      .eq('id', jobId)

    console.log('Fetching embeddings for price list')
    const priceEmbeddings = await getEmbeddingsBatch(cohereApiKey, priceDescriptions, "search_document")
    
    await supabase
      .from('ai_matching_jobs')
      .update({ progress: 60 })
      .eq('id', jobId)

    console.log('Fetching embeddings for inquiry items')
    const inquiryEmbeddings = await getEmbeddingsBatch(cohereApiKey, inquiryDescriptions, "search_query")

    await supabase
      .from('ai_matching_jobs')
      .update({ progress: 80 })
      .eq('id', jobId)

    console.log('Computing similarity scores...')

    // Process matches
    const matchResults = []
    let totalConfidence = 0

    for (let i = 0; i < excelItems.length; i++) {
      const item = excelItems[i]
      const inquiryEmbed = inquiryEmbeddings[i]
      
      let bestMatch = null
      let bestScore = 0
      
      // Compare with all price items
      for (let j = 0; j < allPriceItems.length; j++) {
        const priceEmbed = priceEmbeddings[j]
        
        // Calculate cosine similarity
        const similarity = cosineSimilarity(inquiryEmbed, priceEmbed)
        
        // Calculate Jaccard similarity for token overlap
        const jaccardScore = jaccardSimilarity(
          inquiryDescriptions[i], 
          priceDescriptions[j]
        )
        
        // Combined score (85% semantic, 15% token overlap)
        const combinedScore = 0.85 * similarity + 0.15 * jaccardScore
        
        if (combinedScore > bestScore) {
          bestScore = combinedScore
          bestMatch = {
            priceItem: allPriceItems[j],
            similarity,
            jaccardScore,
            combinedScore
          }
        }
      }
      
      if (bestMatch) {
        totalConfidence += bestMatch.combinedScore

        // Store match result
        const { error: resultError } = await supabase
          .from('match_results')
          .insert({
            job_id: jobId,
            sheet_name: item.sheet,
            row_number: item.row,
            original_description: item.description,
            preprocessed_description: inquiryDescriptions[i],
            matched_price_item_id: bestMatch.priceItem.id,
            matched_description: bestMatch.priceItem.description,
            matched_rate: bestMatch.priceItem.rate,
            similarity_score: bestMatch.similarity,
            jaccard_score: bestMatch.jaccardScore,
            combined_score: bestMatch.combinedScore,
            quantity: item.quantity
          })

        if (resultError) {
          console.error('Error storing result:', resultError)
        }

        matchResults.push({
          original: item.description,
          matched: bestMatch.priceItem.description,
          rate: bestMatch.priceItem.rate,
          score: bestMatch.combinedScore
        })
      }

      // Update progress
      const progress = 80 + Math.floor((i + 1) / excelItems.length * 15)
      await supabase
        .from('ai_matching_jobs')
        .update({ progress })
        .eq('id', jobId)
    }

    const avgConfidence = Math.round((totalConfidence / excelItems.length) * 100)

    // Complete the job
    await supabase
      .from('ai_matching_jobs')
      .update({ 
        status: 'completed',
        progress: 100,
        matched_items: matchResults.length,
        confidence_score: avgConfidence,
        results: { matches: matchResults }
      })
      .eq('id', jobId)

    console.log(`Processing completed. Matched ${matchResults.length} items with ${avgConfidence}% average confidence`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processing completed successfully. Matched ${matchResults.length} items from your Excel file.`,
        matchedItems: matchResults.length,
        avgConfidence 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Processing error:', error)
    
    // Try to update job status to failed if we have the jobId
    if (jobId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        await supabase
          .from('ai_matching_jobs')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', jobId)
      } catch (updateError) {
        console.error('Failed to update job status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Processing failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
