#!/usr/bin/env node

import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';

console.log('🚀 Manual AWS Lambda Deployment Script\n');

// Configure AWS
const lambda = new AWS.Lambda({ region: 'us-east-1' });
const apigateway = new AWS.APIGatewayV2({ region: 'us-east-1' });
const iam = new AWS.IAM();
const s3 = new AWS.S3({ region: 'us-east-1' });

const FUNCTION_NAME = 'mjd-backend-manual';
const BUCKET_NAME = 'mjd-backend-manual-uploads';
const ROLE_NAME = 'mjd-backend-lambda-role';

async function createZipFile() {
  console.log('📦 Creating deployment package...');
  
  const output = fs.createWriteStream('deployment.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  // Add files
  archive.file('handler.js', { name: 'handler.js' });
  archive.file('app.js', { name: 'app.js' });
  archive.directory('routes/', 'routes/');
  archive.directory('services/', 'services/');
  archive.file('package.json', { name: 'package.json' });
  
  await archive.finalize();
  
  return new Promise((resolve) => {
    output.on('close', () => {
      console.log('✅ Deployment package created (', archive.pointer(), 'bytes)');
      resolve();
    });
  });
}

async function createIAMRole() {
  console.log('🔑 Creating IAM role...');
  
  const trustPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'lambda.amazonaws.com' },
        Action: 'sts:AssumeRole'
      }
    ]
  };
  
  try {
    const role = await iam.createRole({
      RoleName: ROLE_NAME,
      AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
      Description: 'Role for MJD Backend Lambda function'
    }).promise();
    
    // Attach policies
    await iam.attachRolePolicy({
      RoleName: ROLE_NAME,
      PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
    }).promise();
    
    // Create custom policy for S3
    const s3Policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket'
          ],
          Resource: [
            `arn:aws:s3:::${BUCKET_NAME}`,
            `arn:aws:s3:::${BUCKET_NAME}/*`
          ]
        }
      ]
    };
    
    await iam.putRolePolicy({
      RoleName: ROLE_NAME,
      PolicyName: 'S3Access',
      PolicyDocument: JSON.stringify(s3Policy)
    }).promise();
    
    console.log('✅ IAM role created');
    return role.Role.Arn;
    
  } catch (error) {
    if (error.code === 'EntityAlreadyExists') {
      console.log('ℹ️  IAM role already exists');
      const role = await iam.getRole({ RoleName: ROLE_NAME }).promise();
      return role.Role.Arn;
    }
    throw error;
  }
}

async function createS3Bucket() {
  console.log('📦 Creating S3 bucket...');
  
  try {
    await s3.createBucket({
      Bucket: BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint: 'us-east-1'
      }
    }).promise();
    
    // Set CORS
    await s3.putBucketCors({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [
              'https://main.d197lvv1o18hb3.amplifyapp.com',
              'http://localhost:8080',
              'http://localhost:5173'
            ],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedHeaders: ['*'],
            MaxAgeSeconds: 3000
          }
        ]
      }
    }).promise();
    
    console.log('✅ S3 bucket created');
    
  } catch (error) {
    if (error.code === 'BucketAlreadyOwnedByYou') {
      console.log('ℹ️  S3 bucket already exists');
    } else {
      throw error;
    }
  }
}

async function deployLambda(roleArn) {
  console.log('🚀 Deploying Lambda function...');
  
  const zipBuffer = fs.readFileSync('deployment.zip');
  
  const params = {
    FunctionName: FUNCTION_NAME,
    Runtime: 'nodejs20.x',
    Role: roleArn,
    Handler: 'handler.handler',
    Code: { ZipFile: zipBuffer },
    Environment: {
      Variables: {
        NODE_ENV: 'production',
        SUPABASE_URL: 'https://yqsumodzyahvxywwfpnc.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnh5d3dmcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU1NTAsImV4cCI6MjA2NTYwMTU1MH0.vfTx3_A7DMpcazSA_pbuYaiMuZvVssKn9JUQUb9qaS4',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnh5d3dmcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyNTU1MCwiZXhwIjoyMDY1NjAxNTUwfQ.eeLQH1KM6Ovs5FPPcfcuCR3ZbgnsuY2sTpZfC1qnz-Q',
        S3_BUCKET_NAME: BUCKET_NAME,
        AWS_REGION: 'us-east-1'
      }
    },
    MemorySize: 1024,
    Timeout: 30
  };
  
  try {
    const result = await lambda.createFunction(params).promise();
    console.log('✅ Lambda function created');
    return result.FunctionArn;
  } catch (error) {
    if (error.code === 'ResourceConflictException') {
      console.log('ℹ️  Lambda function already exists, updating...');
      await lambda.updateFunctionCode({
        FunctionName: FUNCTION_NAME,
        ZipFile: zipBuffer
      }).promise();
      
      await lambda.updateFunctionConfiguration({
        FunctionName: FUNCTION_NAME,
        Environment: params.Environment,
        MemorySize: params.MemorySize,
        Timeout: params.Timeout
      }).promise();
      
      const func = await lambda.getFunction({ FunctionName: FUNCTION_NAME }).promise();
      console.log('✅ Lambda function updated');
      return func.Configuration.FunctionArn;
    }
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Install production dependencies
    console.log('📦 Installing production dependencies...');
    try {
      execSync('npm install --production', { stdio: 'inherit' });
      console.log('✅ Dependencies installed\n');
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
      process.exit(1);
    }
    
    // Step 2: Create deployment package
    console.log('📁 Creating deployment package...');
    try {
      // Remove old zip if exists
      if (fs.existsSync('../lambda-function.zip')) {
        fs.unlinkSync('../lambda-function.zip');
      }
      
      // Create new zip (excluding unnecessary files)
      const excludeFiles = [
        'node_modules/.cache/*',
        '*.log',
        'temp/*',
        'output/*',
        '.env*',
        'deploy-manual.js',
        'test-*.js'
      ];
      
      const excludeArgs = excludeFiles.map(pattern => `-x "${pattern}"`).join(' ');
      execSync(`zip -r ../lambda-function.zip . ${excludeArgs}`, { stdio: 'inherit' });
      
      console.log('✅ Deployment package created: lambda-function.zip\n');
    } catch (error) {
      console.error('❌ Failed to create deployment package:', error.message);
      process.exit(1);
    }
    
    // Step 3: Instructions for AWS Console
    console.log('📋 Next Steps:');
    console.log('==============');
    console.log('1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda/');
    console.log('2. Click "Create function"');
    console.log('3. Choose "Author from scratch"');
    console.log('4. Configure:');
    console.log('   - Function name: mjd-backend');
    console.log('   - Runtime: Node.js 20.x');
    console.log('   - Architecture: x86_64');
    console.log('5. Upload the lambda-function.zip file');
    console.log('6. Set handler to: lambda-handler.handler');
    console.log('7. Set timeout to: 15 minutes');
    console.log('8. Set memory to: 2048 MB');
    console.log('9. Add environment variables:');
    console.log('   - SUPABASE_URL: https://yqsumodzyahvxywwfpnc.supabase.co');
    console.log('   - SUPABASE_ANON_KEY: (your anon key)');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY: (your service role key)');
    console.log('   - NODE_ENV: production');
    console.log('\n10. Create API Gateway:');
    console.log('    - Go to API Gateway Console');
    console.log('    - Create HTTP API');
    console.log('    - Add Lambda integration');
    console.log('    - Configure CORS for your Amplify domain');
    console.log('\n✅ Deployment package ready!');
    console.log('📦 File location: ../lambda-function.zip');
    
    // Get file size
    const stats = fs.statSync('../lambda-function.zip');
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Package size: ${fileSizeInMB} MB`);
    
    if (fileSizeInMB > 50) {
      console.log('⚠️  Warning: Package is quite large. Consider removing unnecessary files.');
    }
    
    // Step 4: Create IAM role
    const roleArn = await createIAMRole();
    
    // Wait for role to propagate
    console.log('⏳ Waiting for IAM role to propagate...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Step 5: Create S3 bucket
    await createS3Bucket();
    
    // Step 6: Deploy Lambda
    const functionArn = await deployLambda(roleArn);
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log(`📋 Function ARN: ${functionArn}`);
    console.log(`📦 S3 Bucket: ${BUCKET_NAME}`);
    console.log('\n📝 Next Steps:');
    console.log('1. Create API Gateway manually in AWS Console');
    console.log('2. Connect it to your Lambda function');
    console.log('3. Enable CORS in API Gateway');
    console.log('4. Update your frontend with the API Gateway URL');
    
    // Cleanup
    fs.unlinkSync('deployment.zip');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main(); 