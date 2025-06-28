#!/usr/bin/env node

/**
 * Debug Supabase RLS Policies
 * This script will help diagnose the RLS policy issue
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const SUPABASE_URL = 'https://yqsumodzyahvxywwfpnc.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnh5d3dmcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyNTU1MCwiZXhwIjoyMDY1NjAxNTUwfQ.eeLQH1KM6Ovs5FPPcfcuCR3ZbgnsuY2sTpZfC1qnz-Q'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function debugRLS() {
  console.log('🔍 Debugging RLS Policies for price_items table...\n')

  try {
    // Check current policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'price_items')
      .eq('schemaname', 'public')

    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError)
      return
    }

    console.log('📋 Current RLS Policies for price_items:')
    console.log('=' .repeat(60))
    policies.forEach(policy => {
      console.log(`Policy: ${policy.policyname}`)
      console.log(`Command: ${policy.cmd}`)
      console.log(`Permissive: ${policy.permissive}`)
      console.log(`Roles: ${policy.roles}`)
      console.log(`Qual: ${policy.qual}`)
      console.log(`With Check: ${policy.with_check}`)
      console.log('-'.repeat(40))
    })

    // Check if RLS is enabled
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT relname, relrowsecurity 
          FROM pg_class 
          WHERE relname = 'price_items' AND relnamespace = (
            SELECT oid FROM pg_namespace WHERE nspname = 'public'
          )
        `
      })

    if (tableError) {
      console.log('⚠️ Could not check RLS status:', tableError.message)
    } else {
      console.log('\n🔒 RLS Status:', tableInfo)
    }

    // Test with service role (should work)
    console.log('\n🧪 Testing INSERT with service role...')
    const testData = {
      description: 'Test item from debug script',
      user_id: 'b749cf77-02d6-4a74-b210-cce3d19f0910', // The user ID from your error
      rate: 10.50
    }

    const { data: insertData, error: insertError } = await supabase
      .from('price_items')
      .insert(testData)
      .select()

    if (insertError) {
      console.log('❌ Service role INSERT failed:', insertError)
    } else {
      console.log('✅ Service role INSERT successful:', insertData)
      
      // Clean up test data
      if (insertData && insertData[0]) {
        await supabase
          .from('price_items')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Cleaned up test data')
      }
    }

  } catch (err) {
    console.error('❌ Debug script error:', err.message)
  }

  // Provide immediate fix
  console.log('\n🚑 IMMEDIATE FIX:')
  console.log('Run this SQL in Supabase SQL Editor:')
  console.log('=' .repeat(60))
  console.log('ALTER TABLE public.price_items DISABLE ROW LEVEL SECURITY;')
  console.log('=' .repeat(60))
  console.log('This will temporarily disable RLS so your Add Item button works.')
  console.log('Then you can fix the policies properly.')
}

debugRLS().catch(console.error)