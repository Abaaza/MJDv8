#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Check Starting...\n');

// Check Node.js version
console.log('📦 Node.js Version:', process.version);
console.log('🏃 Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 Platform:', process.platform);

// Check Supabase configuration
console.log('\n🗄️ Supabase Configuration:');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

// Test Supabase connection
if (supabaseUrl && supabaseAnonKey) {
  try {
    console.log('\n🔗 Testing Supabase Connection...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('price_items')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase Connection Failed:', error.message);
    } else {
      console.log('✅ Supabase Connection Successful');
    }
  } catch (error) {
    console.log('❌ Supabase Connection Error:', error.message);
  }
} else {
  console.log('⚠️ Skipping Supabase test - missing configuration');
}

// Check Vercel Blob configuration
console.log('\n📦 Vercel Blob Configuration:');
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
console.log('Blob Token:', blobToken ? '✅ Set' : '❌ Missing (will use local storage)');

// Check other environment variables
console.log('\n🔧 Other Configuration:');
console.log('PORT:', process.env.PORT || '3001 (default)');
console.log('VERCEL:', process.env.VERCEL ? '✅ Running on Vercel' : '❌ Not on Vercel');

console.log('\n✅ Environment check completed!');

export default true; 