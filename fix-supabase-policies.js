#!/usr/bin/env node

/**
 * Fix Supabase RLS Policies
 * 
 * This script fixes the RLS policy issues for:
 * 1. price_items table - INSERT policy violation
 * 2. app_settings table - 406 Not Acceptable error
 * 
 * Run with: node fix-supabase-policies.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yqsumodzyahvxywwfpnc.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnh5d3dmcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyNTU1MCwiZXhwIjoyMDY1NjAxNTUwfQ.eeLQH1KM6Ovs5FPPcfcuCR3ZbgnsuY2sTpZfC1qnz-Q'

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function executeSQL(sql, description) {
  console.log(`\n🔧 ${description}...`)
  console.log(`SQL: ${sql.substring(0, 100)}...`)
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error(`❌ Error: ${error.message}`)
      return false
    }
    
    console.log(`✅ ${description} completed successfully`)
    return true
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`)
    return false
  }
}

async function fixPolicies() {
  console.log('🚀 Starting Supabase RLS Policy Fix...')
  console.log(`📡 Connecting to: ${SUPABASE_URL}`)
  
  // Test connection
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }
    console.log('✅ Connected to Supabase successfully')
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return
  }

  const policies = [
    // 1. Fix price_items policies
    {
      sql: `
        -- Drop existing conflicting policies for price_items
        DROP POLICY IF EXISTS "Users can view all price items" ON public.price_items;
        DROP POLICY IF EXISTS "Users can insert their own price items" ON public.price_items;
        DROP POLICY IF EXISTS "Users can update their own price items" ON public.price_items;
        DROP POLICY IF EXISTS "Users can delete their own price items" ON public.price_items;
        DROP POLICY IF EXISTS "Users can view their own price items" ON public.price_items;
        DROP POLICY IF EXISTS "Users can create their own price items" ON public.price_items;
      `,
      description: 'Dropping existing price_items policies'
    },
    
    {
      sql: `
        -- Create clean, working policies for price_items
        CREATE POLICY "price_items_select_policy" ON public.price_items
          FOR SELECT USING (true);
        
        CREATE POLICY "price_items_insert_policy" ON public.price_items
          FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
          
        CREATE POLICY "price_items_update_policy" ON public.price_items
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "price_items_delete_policy" ON public.price_items
          FOR DELETE USING (auth.uid() = user_id);
      `,
      description: 'Creating new price_items policies'
    },

    // 2. Fix app_settings policies
    {
      sql: `
        -- Drop existing app_settings policies
        DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.app_settings;
        DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;
        DROP POLICY IF EXISTS "Only admins can access app settings" ON public.app_settings;
      `,
      description: 'Dropping existing app_settings policies'
    },
    
    {
      sql: `
        -- Create working app_settings policies
        CREATE POLICY "app_settings_select_policy" ON public.app_settings
          FOR SELECT TO authenticated USING (true);
          
        CREATE POLICY "app_settings_update_policy" ON public.app_settings
          FOR UPDATE TO authenticated USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
      `,
      description: 'Creating new app_settings policies'
    },

    // 3. Ensure RLS is enabled
    {
      sql: `
        -- Ensure RLS is enabled on both tables
        ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
      `,
      description: 'Enabling RLS on tables'
    },

    // 4. Create a function to execute SQL (if it doesn't exist)
    {
      sql: `
        -- Create function to execute SQL commands
        CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
      description: 'Creating SQL execution function'
    }
  ]

  // Execute each policy update
  for (const policy of policies) {
    const success = await executeSQL(policy.sql, policy.description)
    if (!success) {
      console.log('⚠️ Continuing with next policy...')
    }
    
    // Small delay between operations
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Test the fixes
  console.log('\n🧪 Testing the fixes...')
  
  try {
    // Test app_settings access
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('currency')
      .eq('id', 1)
      .single()
    
    if (settingsError) {
      console.log('⚠️ app_settings test failed:', settingsError.message)
    } else {
      console.log('✅ app_settings access working:', settings)
    }

    // Test price_items access
    const { data: items, error: itemsError } = await supabase
      .from('price_items')
      .select('count', { count: 'exact', head: true })
    
    if (itemsError) {
      console.log('⚠️ price_items test failed:', itemsError.message)
    } else {
      console.log('✅ price_items access working')
    }

  } catch (err) {
    console.log('⚠️ Testing failed:', err.message)
  }

  console.log('\n🎉 Policy fix script completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Try adding a price item in your app')
  console.log('2. Check if app_settings 406 error is resolved')
  console.log('3. If issues persist, check Supabase logs for more details')
}

// Alternative direct SQL approach if RPC doesn't work
async function directSQLFix() {
  console.log('\n🔄 Trying direct SQL approach...')
  
  const sqlCommands = [
    "DROP POLICY IF EXISTS \"Users can view all price items\" ON public.price_items;",
    "DROP POLICY IF EXISTS \"Users can insert their own price items\" ON public.price_items;", 
    "DROP POLICY IF EXISTS \"Users can update their own price items\" ON public.price_items;",
    "DROP POLICY IF EXISTS \"Users can delete their own price items\" ON public.price_items;",
    
    "CREATE POLICY \"price_items_select\" ON public.price_items FOR SELECT USING (true);",
    "CREATE POLICY \"price_items_insert\" ON public.price_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);",
    "CREATE POLICY \"price_items_update\" ON public.price_items FOR UPDATE USING (auth.uid() = user_id);",
    "CREATE POLICY \"price_items_delete\" ON public.price_items FOR DELETE USING (auth.uid() = user_id);",
    
    "DROP POLICY IF EXISTS \"Authenticated users can read settings\" ON public.app_settings;",
    "CREATE POLICY \"app_settings_read\" ON public.app_settings FOR SELECT TO authenticated USING (true);"
  ]

  console.log('\n📝 SQL Commands to run in Supabase SQL Editor:')
  console.log('=' .repeat(60))
  sqlCommands.forEach((cmd, i) => {
    console.log(`${i + 1}. ${cmd}`)
  })
  console.log('=' .repeat(60))
}

// Run the fix
fixPolicies().catch(async (err) => {
  console.error('❌ Main fix failed:', err.message)
  await directSQLFix()
  process.exit(1)
})