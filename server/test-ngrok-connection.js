import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const NGROK_URL = 'https://1532-41-68-52-168.ngrok-free.app';
const LOCAL_URL = `http://localhost:${process.env.PORT || 3001}`;

console.log('🔍 Testing ngrok connection...\n');
console.log(`Ngrok URL: ${NGROK_URL}`);
console.log(`Local URL: ${LOCAL_URL}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

async function testEndpoint(url, endpoint, description) {
  console.log(`\n📍 Testing ${description}:`);
  console.log(`   URL: ${url}${endpoint}`);
  
  try {
    const response = await axios.get(`${url}${endpoint}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 5000
    });
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Response:`, JSON.stringify(response.data).substring(0, 100) + '...');
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ HTTP Error: ${error.response.status} ${error.response.statusText}`);
      console.log(`   ❌ Response:`, error.response.data);
    } else if (error.request) {
      console.log(`   ❌ No response received`);
      console.log(`   ❌ Error:`, error.message);
    } else {
      console.log(`   ❌ Request setup error:`, error.message);
    }
  }
}

async function runTests() {
  // Test local server first
  console.log('=== Testing Local Server ===');
  await testEndpoint(LOCAL_URL, '/health', 'Health Check');
  await testEndpoint(LOCAL_URL, '/api/user-management/users', 'User Management API');
  
  // Test ngrok tunnel
  console.log('\n\n=== Testing Ngrok Tunnel ===');
  await testEndpoint(NGROK_URL, '/health', 'Health Check via Ngrok');
  await testEndpoint(NGROK_URL, '/api/user-management/users', 'User Management API via Ngrok');
  
  // Test CORS headers
  console.log('\n\n=== Testing CORS Headers ===');
  try {
    const response = await axios.options(`${NGROK_URL}/api/user-management/users`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('✅ CORS preflight successful');
    console.log('   Headers:', response.headers);
  } catch (error) {
    console.log('❌ CORS preflight failed:', error.message);
    if (error.response) {
      console.log('   Response headers:', error.response.headers);
    }
  }
}

runTests().catch(console.error); 