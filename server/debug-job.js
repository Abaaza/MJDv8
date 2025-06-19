import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentJobs() {
  try {
    const { data, error } = await supabase
      .from('ai_matching_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Recent jobs:');
    data.forEach(job => {
      console.log(`\n📋 Job: ${job.id}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Progress: ${job.progress}%`);
      console.log(`   Total Items: ${job.total_items || 'NULL'}`);
      console.log(`   Matched Items: ${job.matched_items || 'NULL'}`);
      console.log(`   Project: ${job.project_name}`);
      console.log(`   Created: ${job.created_at}`);
      console.log(`   Updated: ${job.updated_at}`);
      console.log(`   Error: ${job.error_message || 'None'}`);
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

checkRecentJobs(); 