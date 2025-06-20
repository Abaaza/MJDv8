import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuditEndpoint() {
  try {
    console.log('Testing audit logs table...');
    
    // First, let's check if we have any audit logs
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(5);
    
    if (logsError) {
      console.error('Error fetching audit logs:', logsError);
      return;
    }
    
    console.log(`Found ${logs?.length || 0} audit logs`);
    if (logs && logs.length > 0) {
      console.log('Sample log:', logs[0]);
    }
    
    // Let's also check the profiles table to see who's admin
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('role', 'admin');
    
    if (adminError) {
      console.error('Error fetching admins:', adminError);
      return;
    }
    
    console.log('\nAdmin users:');
    admins?.forEach(admin => {
      console.log(`- ${admin.name} (${admin.id})`);
    });
    
    // Insert a test audit log
    console.log('\nInserting test audit log...');
    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: admins?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        action: 'TEST_ACTION',
        table_name: 'test',
        record_id: 'test-123'
      }]);
    
    if (insertError) {
      console.error('Error inserting audit log:', insertError);
    } else {
      console.log('Test audit log inserted successfully!');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAuditEndpoint(); 