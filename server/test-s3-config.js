import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== S3 Configuration Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME || '(not set)');
console.log('AWS_REGION:', process.env.AWS_REGION || '(not set)');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '(set)' : '(not set)');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '(set)' : '(not set)');

// Test S3Service
import S3Service from './services/S3Service.js';

console.log('\n=== S3Service Status ===');
console.log('Is Local Mode:', S3Service.isLocalMode);
console.log('Bucket Name:', S3Service.bucketName || '(not set)');

// Test bucket access
console.log('\n=== Testing Bucket Access ===');
try {
  const hasAccess = await S3Service.checkBucketAccess();
  console.log('Bucket Access:', hasAccess ? 'SUCCESS' : 'FAILED');
} catch (error) {
  console.error('Bucket Access Error:', error.message);
}

console.log('\n=== Test Complete ===');
process.exit(0); 