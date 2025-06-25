require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./config/database');

async function resetPassword() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    await prisma.user.update({
      where: { email: 'admin@taskmanager.com' },
      data: { passwordHash }
    });
    
    console.log('✅ Admin password reset to: admin123');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetPassword();