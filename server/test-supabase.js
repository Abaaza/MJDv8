import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

console.log('🧪 Testing Supabase Connection...')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING')
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING')

if (!process.env.SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL!')
  process.exit(1)
}

// Use service role key if available (bypasses RLS), otherwise use anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Missing both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY!')
  process.exit(1)
}

console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (admin)' : 'ANON (limited)')

const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseKey
)

async function testConnection() {
  try {
    console.log('\n🔍 Testing database connection...')
    
    // Test basic connection (bypassing RLS for admin access)
    const { data, error } = await supabase
      .from('ai_matching_jobs')
      .select('id, status, created_at, user_id')
      .limit(10)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Database query failed:', error)
      return false
    }
    
    console.log('✅ Database connection successful!')
    console.log(`📊 Found ${data.length} recent jobs`)
    
    if (data.length > 0) {
      console.log('📋 Recent jobs:')
      data.forEach(job => {
        console.log(`  - ${job.id}: ${job.status} (${job.created_at})`)
      })
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection is working properly!')
    console.log('You can now restart the server: node server.js')
  } else {
    console.log('\n💥 Supabase connection failed!')
    console.log('Please check your .env file and credentials')
  }
}) 