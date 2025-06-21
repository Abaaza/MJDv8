#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

console.log('🚀 MJD Backend Deployment Script\n');

// Check if .env file exists
const envPath = './.env';
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📋 Creating .env file from production template...\n');
  
  // Copy production template to .env
  try {
    fs.copyFileSync('./env.production', './.env');
    console.log('✅ .env file created from template');
    console.log('ℹ️  Please verify the values in .env before continuing\n');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
}

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('🔍 Validating environment variables...');
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please add these variables to your .env file');
  process.exit(1);
}

console.log('✅ All required environment variables are set\n');

// Check AWS credentials
console.log('🔑 Checking AWS credentials...');
try {
  execSync('aws sts get-caller-identity', { stdio: 'pipe' });
  console.log('✅ AWS credentials are configured\n');
} catch (error) {
  console.log('❌ AWS credentials not configured');
  console.log('📝 Please run: aws configure');
  console.log('   Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables\n');
  process.exit(1);
}

// Get deployment stage
const stage = process.argv[2] || 'prod';
const region = process.argv[3] || 'us-east-1';

console.log(`📦 Deploying to stage: ${stage}`);
console.log(`🌍 Region: ${region}\n`);

// Run pre-deployment checks
console.log('🔧 Running pre-deployment checks...');
try {
  execSync('npm run check-env', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Environment check completed with warnings\n');
}

// Install dependencies
console.log('📚 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Deploy with serverless
console.log('🚀 Starting serverless deployment...\n');
try {
  const deployCommand = `npx serverless deploy --stage ${stage} --region ${region} --verbose`;
  console.log(`Running: ${deployCommand}\n`);
  
  execSync(deployCommand, { stdio: 'inherit' });
  
  console.log('\n🎉 Deployment completed successfully!');
  
  // Get the API endpoint
  try {
    const infoOutput = execSync(`npx serverless info --stage ${stage} --region ${region}`, { encoding: 'utf8' });
    const endpointMatch = infoOutput.match(/https:\/\/[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com/);
    
    if (endpointMatch) {
      const apiEndpoint = endpointMatch[0];
      console.log(`\n🔗 API Endpoint: ${apiEndpoint}`);
      console.log(`📊 Health Check: ${apiEndpoint}/health`);
      console.log(`🔄 Price Matching: ${apiEndpoint}/price-matching`);
      console.log(`👥 User Management: ${apiEndpoint}/user-management`);
      
      // Update frontend configuration reminder
      console.log('\n📝 Next Steps:');
      console.log('1. Update your frontend API_BASE_URL to:');
      console.log(`   ${apiEndpoint}`);
      console.log('2. Test the endpoints above');
      console.log('3. Deploy your frontend with the new API URL');
    }
  } catch (error) {
    console.log('ℹ️  Could not retrieve API endpoint automatically');
  }
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('\n✨ Deployment script completed!\n'); 