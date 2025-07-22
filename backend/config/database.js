const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production (Railway), create a single instance
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  });
} else {
  // In development, use global variable to prevent multiple instances during hot reload
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.__prisma;
}

// Connection test function
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test with a simple query to verify tables exist
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database tables accessible');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // More specific error handling
    if (error.code === 'P1001') {
      console.error('Cannot reach database server. Check DATABASE_URL');
    } else if (error.code === 'P1003') {
      console.error('Database does not exist');
    } else if (error.code === 'P1008') {
      console.error('Database connection timeout');
    }
    
    return false;
  }
}

// Graceful shutdown
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('📡 Database disconnected gracefully');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
}

// Health check function
async function checkDatabaseHealth() {
  try {
    // Check if we can query each main table
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const taskCount = await prisma.task.count();
    const commentCount = await prisma.comment.count();
    
    return {
      connected: true,
      tables: {
        users: userCount,
        projects: projectCount,
        tasks: taskCount,
        comments: commentCount,
      },
      status: 'healthy'
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      status: 'unhealthy'
    };
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
};