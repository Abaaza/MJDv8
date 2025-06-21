import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
)

async function testProgressUpdates() {
  console.log('\n🧪 Testing Progress Updates...')
  
  // Test if we can update job status with proper progress
  const testJobId = 'test-' + Date.now()
  
  try {
    // Create a test job
    const { data: job, error: createError } = await supabase
      .from('ai_matching_jobs')
      .insert({
        id: testJobId,
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy user
        project_name: 'Test Progress',
        original_filename: 'test.xlsx',
        status: 'pending'
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Failed to create test job:', createError)
      return
    }
    
    console.log('✅ Created test job:', testJobId)
    
    // Test progress updates
    const progressSteps = [
      { progress: 10, message: 'Starting file analysis...' },
      { progress: 20, message: 'Parsing Excel file...' },
      { progress: 30, message: 'Found items to match' },
      { progress: 40, message: 'Loading price database...' },
      { progress: 45, message: 'Preparing to match' },
      { progress: 50, message: 'Matching in progress...' }
    ]
    
    for (const step of progressSteps) {
      const { error: updateError } = await supabase
        .from('ai_matching_jobs')
        .update({
          status: 'processing',
          progress: step.progress,
          error_message: step.message
        })
        .eq('id', testJobId)
      
      if (updateError) {
        console.error(`❌ Failed to update progress to ${step.progress}%:`, updateError)
      } else {
        console.log(`✅ Progress updated to ${step.progress}%: ${step.message}`)
      }
      
      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Cleanup
    await supabase.from('ai_matching_jobs').delete().eq('id', testJobId)
    console.log('✅ Progress update test completed')
    
  } catch (error) {
    console.error('❌ Progress test error:', error)
  }
}

async function testTableStructure() {
  console.log('\n🧪 Testing Table Structure...')
  
  try {
    // Check if ai_matching_jobs table has the required columns
    const { data: job, error } = await supabase
      .from('ai_matching_jobs')
      .select('id, status, progress, error_message, matched_items, total_items, confidence_score, original_file_path, input_file_blob_key, output_file_blob_key')
      .limit(1)
    
    if (error) {
      console.error('❌ Error checking table structure:', error)
    } else {
      console.log('✅ Table structure looks good')
      console.log('   Available columns verified')
    }
    
    // Check app_settings for Cohere API key
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('cohere_api_key')
      .limit(1)
      .single()
    
    if (settingsError) {
      console.error('⚠️  No app_settings found:', settingsError.message)
    } else if (settings?.cohere_api_key) {
      console.log('✅ Cohere API key found in app_settings')
    } else {
      console.log('⚠️  No Cohere API key in app_settings')
    }
    
  } catch (error) {
    console.error('❌ Table structure test error:', error)
  }
}

async function testAccessRequests() {
  console.log('\n🧪 Testing Access Requests Table...')
  
  try {
    // Check if access_requests table exists
    const { data, error } = await supabase
      .from('access_requests')
      .select('id, email, status')
      .limit(1)
    
    if (error) {
      console.error('⚠️  Access requests table might not exist:', error.message)
    } else {
      console.log('✅ Access requests table exists')
    }
    
  } catch (error) {
    console.error('❌ Access requests test error:', error)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Fix Verification Tests...')
  console.log('=====================================')
  
  await testTableStructure()
  await testProgressUpdates()
  await testAccessRequests()
  
  console.log('\n✅ All tests completed!')
  console.log('=====================================')
  
  process.exit(0)
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
}) 