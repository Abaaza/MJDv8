
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('ai_matching_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    if (job.status !== 'completed') {
      throw new Error('Job is not completed')
    }

    // Get match results
    const { data: results, error: resultsError } = await supabase
      .from('match_results')
      .select(`
        *,
        matched_price_item:price_items!matched_price_item_id(description, rate, unit)
      `)
      .eq('job_id', jobId)
      .order('sheet_name, row_number')

    if (resultsError) {
      throw new Error(`Failed to get results: ${resultsError.message}`)
    }

    // Generate CSV content (simplified Excel generation)
    const csvHeaders = [
      'Sheet',
      'Row',
      'Original Description',
      'Matched Description', 
      'Rate',
      'Unit',
      'Quantity',
      'Similarity Score',
      'Combined Score'
    ]

    const csvRows = results?.map(result => [
      result.sheet_name,
      result.row_number,
      `"${result.original_description}"`,
      `"${result.matched_description || ''}"`,
      result.matched_rate || '',
      result.matched_price_item?.unit || '',
      result.quantity || '',
      result.similarity_score?.toFixed(3) || '',
      result.combined_score?.toFixed(3) || ''
    ]) || []

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Convert to base64
    const encoder = new TextEncoder()
    const data = encoder.encode(csvContent)
    const base64Data = btoa(String.fromCharCode(...data))

    const fileName = `${job.project_name}_Results_${new Date().toISOString().split('T')[0]}.csv`

    return new Response(
      JSON.stringify({ 
        success: true,
        fileName,
        fileData: base64Data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Download error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Download failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
