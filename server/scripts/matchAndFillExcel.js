import fs from 'fs'
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'
import { preprocess } from '../services/matchService.js'

const EMBED_MODEL = 'embed-english-v3.0'
const BATCH = 50

function cosine(a,b){
  let dot=0,na=0,nb=0
  for(let i=0;i<a.length;i++){
    dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]
  }
  return dot/(Math.sqrt(na)*Math.sqrt(nb))
}
function jaccard(a,b){
  const setA=new Set(a.split(/\s+/)), setB=new Set(b.split(/\s+/))
  const inter=new Set([...setA].filter(x=>setB.has(x)))
  const union=new Set([...setA,...setB])
  return union.size===0?0:inter.size/union.size
}

async function embedTexts(apiKey,texts,inputType='search_document'){
  const out=[]
  for(let i=0;i<texts.length;i+=BATCH){
    const batch=texts.slice(i,i+BATCH)
    const res=await fetch('https://api.cohere.ai/v1/embed',{
      method:'POST',
      headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({texts:batch,model:EMBED_MODEL,input_type:inputType,embedding_types:['float']})
    })
    if(!res.ok) throw new Error(`Cohere API error ${res.status}`)
    const data=await res.json()
    if(data.embeddings&&data.embeddings.float) out.push(...data.embeddings.float)
  }
  return out
}

async function main(){
  const [input,output]=process.argv.slice(2)
  if(!input||!output){
    console.error('Usage: node matchAndFillExcel.js <input.xlsx> <output.xlsx>')
    process.exit(1)
  }
  const supabaseUrl=process.env.SUPABASE_URL
  const supabaseKey=process.env.SUPABASE_SERVICE_ROLE_KEY
  const cohereKey=process.env.COHERE_API_KEY
  if(!supabaseUrl||!supabaseKey||!cohereKey){
    console.error('Missing environment variables')
    process.exit(1)
  }
  const supabase=createClient(supabaseUrl,supabaseKey)
  const {data:priceItems,error}=await supabase
    .from('price_items')
    .select('id,description,rate,full_context')
    .not('rate','is',null)
  if(error) throw error
  const priceTexts=priceItems.map(p=>preprocess(p.full_context||p.description))
  const priceEmbeds=await embedTexts(cohereKey,priceTexts,'search_document')

  const workbook=new ExcelJS.Workbook()
  await workbook.xlsx.readFile(input)

  for(const worksheet of workbook.worksheets){
    let headerRow=null,descCol=null,qtyCol=null,rateCol=null
    for(let r=1;r<=Math.min(10,worksheet.rowCount);r++){
      const row=worksheet.getRow(r)
      const values=row.values.map(v=>String(v||'').toLowerCase())
      if(values.some(v=>/(description|desc)/.test(v))&&values.some(v=>/(qty|quantity)/.test(v))){
        headerRow=r
        descCol=values.findIndex(v=>/(description|desc)/.test(v));
        qtyCol=values.findIndex(v=>/(qty|quantity)/.test(v));
        rateCol=values.findIndex(v=>/(rate|price|unit\s*rate|unit\s*price)/.test(v));
        break
      }
    }
    if(headerRow===null||descCol===-1||qtyCol===-1) continue
    descCol++;qtyCol++;rateCol=rateCol!==-1?rateCol+1:worksheet.columnCount+1
    if(rateCol>worksheet.columnCount){
      worksheet.getRow(headerRow).getCell(rateCol).value='Rate'
    }
    const items=[]
    for(let r=headerRow+1;r<=worksheet.rowCount;r++){
      const row=worksheet.getRow(r)
      const desc=row.getCell(descCol).value
      if(desc){
        items.push({sheet:worksheet.name,row:r,desc:String(desc),qty:parseFloat(row.getCell(qtyCol).value)||0})
      }
    }
    const itemTexts=items.map(i=>preprocess(i.desc))
    const itemEmbeds=await embedTexts(cohereKey,itemTexts,'search_query')
    for(let i=0;i<items.length;i++){
      let best=null,bestScore=0
      for(let j=0;j<priceItems.length;j++){
        const score=0.85*cosine(itemEmbeds[i],priceEmbeds[j])+0.15*jaccard(itemTexts[i],priceTexts[j])
        if(score>bestScore){bestScore=score;best=j}
      }
      if(best!==null){
        const price=priceItems[best]
        const row=worksheet.getRow(items[i].row)
        row.getCell(rateCol).value=price.rate
      }
    }
  }
  await workbook.xlsx.writeFile(output)
  console.log('Saved matched workbook to',output)
}

if(require.main===module){
  main().catch(err=>{console.error(err);process.exit(1)})
}
