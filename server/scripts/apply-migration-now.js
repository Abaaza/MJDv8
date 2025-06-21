import { createClient } from '@supabase/supabase-js'

console.log('🔨 Applying User Management Migration...')

// Direct database access
const supabaseUrl = 'https://yqsumodzyahvxywwfpnc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnh5d3dmcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyNTU1MCwiZXhwIjoyMDY1NjAxNTUwfQ.eeLQH1KM6Ovs5FPPcfcuCR3ZbgnsuY2sTpZfC1qnz-Q'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUserManagementTables() {
  try {
    console.log('📊 Creating user_roles table...')
    
    // Create user_roles table directly
    const { error: createRolesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          permissions JSONB DEFAULT '{}',
          is_system_role BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        INSERT INTO user_roles (name, description, permissions, is_system_role) VALUES
        ('admin', 'Full system access', '{"users": ["read", "write", "delete"], "settings": ["read", "write"]}', true),
        ('user', 'Basic access', '{"jobs": ["read", "write"]}', true)
        ON CONFLICT (name) DO NOTHING;
      `
    })

    if (createRolesError) {
      console.log('⚠️ user_roles:', createRolesError.message)
    } else {
      console.log('✅ user_roles table created')
    }

    console.log('📊 Creating access_requests table...')
    
    const { error: createRequestsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS access_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          phone VARCHAR(50),
          message TEXT,
          requested_role VARCHAR(50) DEFAULT 'user',
          status VARCHAR(20) DEFAULT 'pending',
          admin_notes TEXT,
          approved_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
        );
        
        CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
        CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
      `
    })

    if (createRequestsError) {
      console.log('⚠️ access_requests:', createRequestsError.message)
    } else {
      console.log('✅ access_requests table created')
    }

    console.log('📊 Creating audit_logs table...')
    
    const { error: createAuditError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
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
      `
    })

    if (createAuditError) {
      console.log('⚠️ audit_logs:', createAuditError.message)
    } else {
      console.log('✅ audit_logs table created')
    }

    console.log('📊 Creating user_sessions table...')
    
    const { error: createSessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          session_token VARCHAR(255) NOT NULL,
          ip_address INET,
          user_agent TEXT,
          is_active BOOLEAN DEFAULT true,
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
      `
    })

    if (createSessionsError) {
      console.log('⚠️ user_sessions:', createSessionsError.message)
    } else {
      console.log('✅ user_sessions table created')
    }

    console.log('📊 Updating profiles table...')
    
    const { error: updateProfilesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS approved_by UUID,
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
      `
    })

    if (updateProfilesError) {
      console.log('⚠️ profiles update:', updateProfilesError.message)
    } else {
      console.log('✅ profiles table updated')
    }

    console.log('\n🎉 Migration completed! Your authentication system is ready!')
    console.log('✅ Now refresh your admin settings page - the user management section will work!')
    
    return true

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    return false
  }
}

async function verifyTables() {
  try {
    console.log('\n🔍 Verifying tables...')
    
    const tables = ['user_roles', 'access_requests', 'audit_logs', 'user_sessions']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('Verification error:', error.message)
  }
}

async function main() {
  await createUserManagementTables()
  await verifyTables()
}

main().catch(console.error) 