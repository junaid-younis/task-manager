require('dotenv').config();
const prisma = require('./config/database');
const bcrypt = require('bcryptjs');

async function checkPasswords() {
  try {
    console.log('🔍 Checking password hashes in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        isActive: true
      }
    });
    
    for (const user of users) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Has Password: ${user.passwordHash ? 'Yes' : 'No'}`);
      
      if (user.passwordHash) {
        console.log(`   Password Hash: ${user.passwordHash.substring(0, 30)}...`);
        
        // Test common passwords
        const testPasswords = ['admin123', 'user123', 'password', '123456'];
        console.log(`   Testing passwords:`);
        
        for (const pwd of testPasswords) {
          try {
            const isValid = await bcrypt.compare(pwd, user.passwordHash);
            console.log(`     ${pwd}: ${isValid ? '✅ MATCH' : '❌'}`);
          } catch (error) {
            console.log(`     ${pwd}: ❌ ERROR - ${error.message}`);
          }
        }
      }
      console.log('   ---\n');
    }
    
  } catch (error) {
    console.error('❌ Error checking passwords:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkPasswords();