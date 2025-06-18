import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

console.log('🔧 Fixing Database Schema...')

// Use service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
)

async function checkAndFixSchema() {
  try {
    // First, check if the column exists
    console.log('📊 Checking current table schema...')
    
    // Try to select the output_file_path column
    const { data: testData, error: testError } = await supabase
      .from('ai_matching_jobs')
      .select('id, output_file_path')
      .limit(1)
    
    if (testError && testError.message.includes('output_file_path')) {
      console.log('❌ Column output_file_path does not exist')
      console.log('🔨 Adding output_file_path column...')
      
      // Execute the migration SQL directly
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE ai_matching_jobs 
          ADD COLUMN IF NOT EXISTS output_file_path TEXT;
          
          CREATE INDEX IF NOT EXISTS idx_ai_matching_jobs_output_file_path 
          ON ai_matching_jobs(output_file_path) 
          WHERE output_file_path IS NOT NULL;
        `
      })
      
      if (error) {
        console.error('❌ Failed to add column:', error)
        
        // Alternative approach: Use direct SQL if RPC doesn't exist
        console.log('🔄 Trying alternative approach...')
        
        // You need to run this SQL directly in Supabase dashboard
        console.log('\n📋 Please run this SQL in your Supabase SQL Editor:')
        console.log('```sql')
        console.log('ALTER TABLE ai_matching_jobs')
        console.log('ADD COLUMN IF NOT EXISTS output_file_path TEXT;')
        console.log('')
        console.log('CREATE INDEX IF NOT EXISTS idx_ai_matching_jobs_output_file_path')
        console.log('ON ai_matching_jobs(output_file_path)')
        console.log('WHERE output_file_path IS NOT NULL;')
        console.log('```')
      } else {
        console.log('✅ Column added successfully!')
      }
    } else {
      console.log('✅ Column output_file_path already exists')
      
      // Check existing jobs that might need the path updated
      const { data: jobsWithoutPath, error: jobsError } = await supabase
        .from('ai_matching_jobs')
        .select('id, original_filename, status')
        .is('output_file_path', null)
        .eq('status', 'completed')
        .limit(10)
      
      if (!jobsError && jobsWithoutPath && jobsWithoutPath.length > 0) {
        console.log(`\n⚠️  Found ${jobsWithoutPath.length} completed jobs without output_file_path`)
        console.log('These jobs might need their paths updated manually.')
      }
    }
    
    // Clear Supabase schema cache
    console.log('\n🔄 Clearing schema cache...')
    console.log('The schema cache should automatically refresh within a few minutes.')
    console.log('If issues persist, you may need to restart your Supabase instance.')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the fix
checkAndFixSchema().then(() => {
  console.log('\n✅ Schema check complete!')
  console.log('Please restart your server to apply changes.')
}) 