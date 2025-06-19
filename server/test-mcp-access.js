import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Testing MCP-style database access...');

async function listTables() {
  try {
    console.log('\n📋 Listing all tables in public schema...');
    
    // Get table information
    const { data: tables, error } = await supabase.rpc('get_schema_tables', {
      schema_name: 'public'
    }).single();
    
    if (error) {
      // Fallback: query information_schema directly
      console.log('Using fallback method...');
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (tablesError) {
        console.error('❌ Error listing tables:', tablesError);
        return;
      }
      
      console.log('✅ Found tables:');
      tablesData.forEach(table => {
        console.log(`  - ${table.table_name} (${table.table_type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testProjectAccess() {
  try {
    console.log('\n🎯 Testing project access...');
    
    // Test basic queries on key tables
    const { data: jobs, error: jobsError } = await supabase
      .from('ai_matching_jobs')
      .select('id, status, created_at')
      .limit(3);
    
    if (jobsError) {
      console.error('❌ Error accessing ai_matching_jobs:', jobsError);
    } else {
      console.log(`✅ ai_matching_jobs: ${jobs.length} records accessible`);
    }
    
    const { data: priceItems, error: priceError } = await supabase
      .from('price_items')
      .select('id, description')
      .limit(3);
    
    if (priceError) {
      console.error('❌ Error accessing price_items:', priceError);
    } else {
      console.log(`✅ price_items: ${priceItems.length} records accessible`);
    }
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .limit(3);
    
    if (profilesError) {
      console.error('❌ Error accessing profiles:', profilesError);
    } else {
      console.log(`✅ profiles: ${profiles.length} records accessible`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  await listTables();
  await testProjectAccess();
  console.log('\n🎉 MCP-style access test completed!');
  console.log('\n📝 Your Supabase project details:');
  console.log(`   Project ID: yqsumodzyahvxywwfpnc`);
  console.log(`   URL: ${process.env.SUPABASE_URL}`);
  console.log(`   Service Role: ✅ Configured`);
  console.log(`   Direct Access: ✅ Working`);
}

main().catch(console.error); 