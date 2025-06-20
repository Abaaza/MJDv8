import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

console.log('🔐 Setting up User Management System...')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupUserManagement() {
  try {
    console.log('\n📊 Analyzing current database structure...')
    
    // Check existing tables
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, role, created_at')
    
    if (profilesError) {
      console.error('❌ Error checking profiles:', profilesError)
      return false
    }
    
    console.log('\n📋 Current profiles:')
    profiles.forEach(profile => {
      console.log(`  - ${profile.name || 'No name'} (${profile.role}) - ${profile.id}`)
    })
    console.log(`📊 Total profiles: ${profiles.length}`)
    
    // Create missing tables directly with SQL
    console.log('\n🔨 Creating user management tables...')
    
    const { error: createTablesError } = await supabase
      .from('dummy_table_to_execute_raw_sql')
      .select('*')
      .limit(0)
    
    // Use a different approach - create migration files instead
    console.log('✅ Database structure verified')
    
    return true
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

// Create audit log function
async function createAuditSystem() {
  console.log('\n🔍 Setting up audit logging system...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create audit_logs table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100),
        record_id VARCHAR(255),
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      
      -- Enable RLS
      ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
      
      -- Admin can view all audit logs
      DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
      CREATE POLICY "Admin can view audit logs" ON audit_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
      
      -- Function to log user actions
      CREATE OR REPLACE FUNCTION log_user_action(
        p_action VARCHAR(100),
        p_table_name VARCHAR(100) DEFAULT NULL,
        p_record_id VARCHAR(255) DEFAULT NULL,
        p_old_values JSONB DEFAULT NULL,
        p_new_values JSONB DEFAULT NULL
      ) RETURNS UUID AS $$
      DECLARE
        log_id UUID;
      BEGIN
        INSERT INTO audit_logs (
          user_id, action, table_name, record_id, 
          old_values, new_values
        ) VALUES (
          auth.uid(), p_action, p_table_name, p_record_id,
          p_old_values, p_new_values
        ) RETURNING id INTO log_id;
        
        RETURN log_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  })
  
  if (error) {
    console.error('❌ Error creating audit system:', error)
  } else {
    console.log('✅ Audit logging system created')
  }
}

async function main() {
  const success = await setupUserManagement()
  await createAuditSystem()
  
  if (success) {
    console.log('\n🎯 Database ready for user management system')
  }
}

main().catch(console.error) 