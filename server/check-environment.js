#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import S3Service from './services/S3Service.js';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Configuration Check\n');

// Check Node.js version
console.log(`📋 Node.js Version: ${process.version}`);
console.log(`📋 Environment: ${process.env.NODE_ENV || 'not set'}\n`);

// Check required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalVars = [
  'S3_BUCKET_NAME',
  'AWS_REGION',
  'PORT'
];

console.log('✅ Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? (value.length > 50 ? `${value.substring(0, 20)}...` : value) : 'NOT SET';
  console.log(`   ${status} ${varName}: ${displayValue}`);
});

console.log('\n📝 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const displayValue = value || 'NOT SET';
  console.log(`   ${status} ${varName}: ${displayValue}`);
});

// Test Supabase connection
console.log('\n🔗 Testing Supabase Connection...');
try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await supabase
    .from('profiles')
    .select('count(*)')
    .limit(1);
  
  if (error) {
    console.log('❌ Supabase connection failed:', error.message);
  } else {
    console.log('✅ Supabase connection successful');
  }
} catch (err) {
  console.log('❌ Supabase connection error:', err.message);
}

// Test S3 Service configuration
console.log('\n📦 Testing S3 Service Configuration...');
try {
  const isLocalMode = process.env.NODE_ENV === 'development' && !process.env.S3_BUCKET_NAME;
  
  if (isLocalMode) {
    console.log('⚠️  S3 Service will use local file storage (development mode)');
  } else if (process.env.S3_BUCKET_NAME) {
    console.log(`✅ S3 Service configured with bucket: ${process.env.S3_BUCKET_NAME}`);
    
    // Test S3 bucket access
    const hasAccess = await S3Service.checkBucketAccess();
    if (hasAccess) {
      console.log('✅ S3 bucket access verified');
    } else {
      console.log('❌ S3 bucket access failed - check AWS credentials and bucket permissions');
    }
  } else {
    console.log('❌ S3 Service not configured - set S3_BUCKET_NAME for production');
  }
} catch (err) {
  console.log('❌ S3 Service error:', err.message);
}

console.log('\n🎯 Summary:');
const hasRequiredVars = requiredVars.every(varName => process.env[varName]);
if (hasRequiredVars) {
  console.log('✅ Basic configuration is complete');
  console.log('   You can start the server with: npm start');
  
  if (process.env.NODE_ENV === 'development' && !process.env.S3_BUCKET_NAME) {
    console.log('ℹ️  Note: Using local file storage for development (S3_BUCKET_NAME not set)');
  }
} else {
  console.log('❌ Missing required environment variables');
  console.log('   Please check your .env file and add the missing variables');
}

console.log('\n💡 Tips:');
console.log('   - Copy .env.example to .env and fill in your values');
console.log('   - For production, ensure S3_BUCKET_NAME is set');
console.log('   - Check AWS credentials if S3 access fails');
console.log('   - Run this script anytime to verify your setup\n'); 