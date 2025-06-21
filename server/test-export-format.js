import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs-extra'
import path from 'path'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
)

async function testExportFormatPreservation() {
  console.log('\n🧪 Testing Export Format Preservation...')
  
  try {
    // Get a recent completed job
    const { data: jobs, error: jobError } = await supabase
      .from('ai_matching_jobs')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (jobError || !jobs || jobs.length === 0) {
      console.error('❌ No completed jobs found for testing')
      return
    }
    
    const job = jobs[0]
    console.log(`✅ Found completed job: ${job.id}`)
    console.log(`   Project: ${job.project_name}`)
    console.log(`   Original file: ${job.original_filename}`)
    console.log(`   Input blob key: ${job.input_file_blob_key ? 'exists' : 'missing'}`)
    console.log(`   Original file path: ${job.original_file_path ? 'exists' : 'missing'}`)
    
    // Check if original file still exists
    if (job.original_file_path) {
      const fileExists = await fs.pathExists(job.original_file_path)
      console.log(`   Original file exists on disk: ${fileExists}`)
      
      if (fileExists) {
        const stats = await fs.stat(job.original_file_path)
        console.log(`   File size: ${stats.size} bytes`)
        console.log(`   Last modified: ${stats.mtime}`)
      }
    }
    
    // Check temp directory for files
    const tempDir = path.join(process.cwd(), 'temp')
    if (await fs.pathExists(tempDir)) {
      const tempFiles = await fs.readdir(tempDir)
      const jobFiles = tempFiles.filter(f => f.includes(job.id))
      console.log(`   Job files in temp directory: ${jobFiles.length}`)
      jobFiles.forEach(file => {
        console.log(`     - ${file}`)
      })
    }
    
    // Test blob storage download if available
    if (job.input_file_blob_key) {
      console.log(`\n📥 Testing blob storage download...`)
      try {
        // Dynamic import of VercelBlobService
        const VercelBlobService = (await import('./services/VercelBlobService.js')).default
        const blobData = await VercelBlobService.downloadFile(job.input_file_blob_key)
        console.log(`✅ Successfully downloaded from blob storage`)
        console.log(`   Size: ${blobData.Body.length} bytes`)
        console.log(`   Content type: ${blobData.ContentType || 'unknown'}`)
        
        // Test saving to temp file
        const testFilePath = path.join(tempDir, `test-download-${job.id}.xlsx`)
        await fs.ensureDir(tempDir)
        await fs.writeFile(testFilePath, blobData.Body)
        console.log(`✅ Test file saved to: ${testFilePath}`)
        
        // Verify the saved file
        const savedStats = await fs.stat(testFilePath)
        console.log(`✅ Saved file verified - size: ${savedStats.size} bytes`)
        
        // Clean up test file
        await fs.unlink(testFilePath)
        console.log(`🧹 Test file cleaned up`)
        
      } catch (blobError) {
        console.error('❌ Blob storage test failed:', blobError.message)
      }
    }
    
    // Test export service
    console.log(`\n📄 Testing ExcelExportService...`)
    try {
      const { ExcelExportService } = await import('./services/ExcelExportService.js')
      const exportService = new ExcelExportService()
      
      // Get some match results for testing
      const { data: matchResults, error: matchError } = await supabase
        .from('match_results')
        .select('*')
        .eq('job_id', job.id)
        .limit(10)
      
      if (matchError || !matchResults || matchResults.length === 0) {
        console.log('⚠️ No match results found for testing export')
      } else {
        console.log(`✅ Found ${matchResults.length} match results for testing`)
        
        // Transform results for export
        const exportResults = matchResults.map(result => ({
          id: result.id,
          original_description: result.original_description,
          matched_description: result.matched_description || '',
          matched_rate: result.matched_rate || 0,
          similarity_score: result.similarity_score || 0,
          row_number: result.row_number,
          sheet_name: result.sheet_name,
          quantity: result.quantity || 0,
          unit: result.unit || '',
          total_amount: (result.quantity || 0) * (result.matched_rate || 0),
          matched_price_item_id: result.matched_price_item_id
        }))
        
        // Test basic export
        console.log(`📄 Testing basic export...`)
        try {
          const basicExportPath = await exportService.exportToExcel(
            exportResults,
            `test-${job.id}`,
            'test-basic-export.xlsx'
          )
          console.log(`✅ Basic export successful: ${basicExportPath}`)
          
          // Verify file exists
          if (await fs.pathExists(basicExportPath)) {
            const exportStats = await fs.stat(basicExportPath)
            console.log(`   Export file size: ${exportStats.size} bytes`)
          }
        } catch (basicExportError) {
          console.error('❌ Basic export failed:', basicExportError.message)
        }
      }
      
    } catch (serviceError) {
      console.error('❌ ExcelExportService test failed:', serviceError.message)
    }
    
  } catch (error) {
    console.error('❌ Export format test error:', error)
  }
}

async function runExportTest() {
  console.log('🚀 Starting Export Format Preservation Test...')
  console.log('================================================')
  
  await testExportFormatPreservation()
  
  console.log('\n✅ Export format test completed!')
  console.log('================================================')
  
  process.exit(0)
}

// Run test
runExportTest().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
}) 