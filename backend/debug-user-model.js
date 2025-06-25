require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function debugUserModel() {
  try {
    console.log('🔍 Testing User model...\n');
    
    const testEmail = 'admin@taskmanager.com';
    console.log(`1. Testing findByEmail for: ${testEmail}`);
    
    const user = await User.findByEmail(testEmail);
    
    if (!user) {
      console.log('❌ User.findByEmail returned null');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      has_password_hash: !!user.password_hash
    });
    
    if (user.password_hash) {
      console.log(`\n2. Testing password comparison...`);
      console.log(`Password hash: ${user.password_hash.substring(0, 30)}...`);
      
      // Test the password that should work
      const testPassword = 'admin123';
      console.log(`Testing password: ${testPassword}`);
      
      try {
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        console.log(`Password comparison result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (!isValid) {
          console.log('\n🔍 Debugging password issue...');
          
          // Check if the hash looks correct
          if (!user.password_hash.startsWith('$2b$') && !user.password_hash.startsWith('$2a$')) {
            console.log('❌ Password hash format looks incorrect');
            console.log('   Expected format: $2b$12$...');
            console.log(`   Actual format: ${user.password_hash.substring(0, 10)}...`);
          }
          
          // Test bcrypt manually
          console.log('\n3. Testing bcrypt with fresh hash...');
          const freshHash = await bcrypt.hash(testPassword, 12);
          const freshTest = await bcrypt.compare(testPassword, freshHash);
          console.log(`Fresh hash test: ${freshTest ? '✅ WORKS' : '❌ BROKEN'}`);
        }
        
      } catch (error) {
        console.log(`❌ Error during password comparison: ${error.message}`);
      }
    } else {
      console.log('❌ User has no password_hash field');
    }
    
  } catch (error) {
    console.error('❌ Error testing User model:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

debugUserModel();