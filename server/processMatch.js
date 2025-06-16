import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import XLSX from 'xlsx'

const EMBED_MODEL = 'embed-english-v3.0'
const BATCH = 50

function preprocess(text) {
  if (!text) return ''
  let s = String(text).toLowerCase()
  s = s.replace(/[^a-z0-9\s]/g, ' ')
  s = s.replace(/\b\d+(?:\.\d+)?\b/g, ' ')
  s = s.replace(/\s+(mm|cm|m|inch|in|ft)\b/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

async function embedTexts(apiKey, texts, inputType='search_document') {
  const out = []
  for (let i=0;i<texts.length;i+=BATCH) {
    const batch = texts.slice(i,i+BATCH)
    const res = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        texts: batch,
        model: EMBED_MODEL,
        input_type: inputType,
        embedding_types: ['float']
      })
    })
    if (!res.ok) {
      throw new Error(`Cohere API error ${res.status}`)
    }
    const data = await res.json()
    if (data.embeddings && data.embeddings.float) {
      out.push(...data.embeddings.float)
    }
  }
  return out
}

function cosine(a,b) {
  let dot=0, na=0, nb=0
  for(let i=0;i<a.length;i++) {
    dot += a[i]*b[i];
    na += a[i]*a[i];
    nb += b[i]*b[i];
  }
  return dot/(Math.sqrt(na)*Math.sqrt(nb))
}

function jaccard(a,b) {
  const setA=new Set(a.split(/\s+/)), setB=new Set(b.split(/\s+/))
  const inter=new Set([...setA].filter(x=>setB.has(x)))
  const union=new Set([...setA,...setB])
  return union.size===0?0:inter.size/union.size
}

export async function processMatch(jobId, base64Data) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const cohereKey = process.env.COHERE_API_KEY
  if(!supabaseUrl||!supabaseKey||!cohereKey) {
    console.error('Missing environment variables')
    return
  }
  const supabase = createClient(supabaseUrl,supabaseKey)

  const { data: priceItems, error: priceErr } = await supabase
    .from('price_items')
    .select('id, description, rate, full_context')
    .not('rate','is',null)
  if(priceErr) throw priceErr

  const priceTexts = priceItems.map(p=>preprocess(p.full_context||p.description))
  const priceEmbeds = await embedTexts(cohereKey, priceTexts, 'search_document')

  const binary = Buffer.from(base64Data, 'base64')
  const wb = XLSX.read(binary, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:''})
  const items = []
  for(let i=1;i<rows.length;i++) {
    const desc = rows[i][0]
    const qty = parseFloat(rows[i][1]) || 0
    if(desc) items.push({desc, qty})
  }

  const itemTexts = items.map(i=>preprocess(i.desc))
  const itemEmbeds = await embedTexts(cohereKey,itemTexts,'search_query')

  for(let i=0;i<items.length;i++) {
    let best=null
    let bestScore=0
    for(let j=0;j<priceItems.length;j++) {
      const sim=cosine(itemEmbeds[i],priceEmbeds[j])
      const jac=jaccard(itemTexts[i],priceTexts[j])
      const score=0.85*sim+0.15*jac
      if(score>bestScore) { bestScore=score; best=j }
    }
    const price=priceItems[best]
    await supabase.from('match_results').insert({
      job_id: jobId,
      original_description: items[i].desc,
      matched_price_item_id: price.id,
      matched_description: price.description,
      matched_rate: price.rate,
      similarity_score: bestScore,
      quantity: items[i].qty
    })
  }

  await supabase.from('ai_matching_jobs')
    .update({status:'completed'})
    .eq('id',jobId)
}

if (require.main === module) {
  const [jobId, filePath] = process.argv.slice(2)
  if (!jobId || !filePath) {
    console.error('Usage: node processMatch.js <jobId> <excelFile>')
    process.exit(1)
  }
  const data = fs.readFileSync(filePath)
  processMatch(jobId, data.toString('base64')).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
