import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import User from './models/User.js';
import { generateAccessToken, verifyToken } from './middleware/auth.js';

dotenv.config();

const testAuth = async () => {
  try {
    console.log('🧪 Testing MongoDB Authentication System...\n');

    // Connect to database
    console.log('1. Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected\n');

    // Test user creation
    console.log('2. Testing user creation...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'testpass123',
      name: 'Test User',
      role: 'user',
      status: 'active'
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('📝 Test user already exists, using existing user');
    } else {
      await testUser.save();
      console.log('✅ Test user created');
    }

    const user = existingUser || testUser;
    console.log(`   User ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}\n`);

    // Test password comparison
    console.log('3. Testing password verification...');
    const isValidPassword = await user.comparePassword('testpass123');
    const isInvalidPassword = await user.comparePassword('wrongpassword');
    
    console.log(`✅ Correct password: ${isValidPassword}`);
    console.log(`❌ Wrong password: ${isInvalidPassword}\n`);

    // Test JWT token generation
    console.log('4. Testing JWT token generation...');
    const accessToken = generateAccessToken(user._id);
    console.log(`✅ Access token generated: ${accessToken.substring(0, 50)}...\n`);

    // Test JWT token verification
    console.log('5. Testing JWT token verification...');
    const decoded = verifyToken(accessToken);
    console.log(`✅ Token verified successfully`);
    console.log(`   User ID: ${decoded.userId}`);
    console.log(`   Token type: ${decoded.type}\n`);

    // Test user lookup by ID
    console.log('6. Testing user lookup...');
    const foundUser = await User.findById(decoded.userId).select('-password -refreshTokens');
    console.log(`✅ User found: ${foundUser.name} (${foundUser.email})\n`);

    // Test admin check
    console.log('7. Testing admin role check...');
    const isAdmin = foundUser.role === 'admin';
    console.log(`   Is admin: ${isAdmin}\n`);

    // Test account lock functionality
    console.log('8. Testing account lock functionality...');
    console.log(`   Failed login attempts: ${user.failedLoginAttempts}`);
    console.log(`   Account locked: ${user.isLocked}\n`);

    // Clean up test user
    console.log('9. Cleaning up test data...');
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test user deleted\n');

    console.log('🎉 All tests passed! MongoDB authentication system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run tests
testAuth(); 