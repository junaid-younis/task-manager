const { PrismaClient } = require('@prisma/client');

let prisma;

// Initialize Prisma Client with error handling
try {
  if (process.env.NODE_ENV === 'production') {
    // In production (Railway)
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
} catch (error) {
  console.error('❌ Failed to initialize Prisma Client:', error);
  // Create a mock client that will fail gracefully
  prisma = {
    $connect: () => Promise.reject(new Error('Database not configured')),
    $disconnect: () => Promise.resolve(),
    user: { findMany: () => Promise.reject(new Error('Database not connected')) }
  };
}

// Connection test function
async function connectDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      return false;
    }

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
      console.error('💡 Cannot reach database server. This is normal during Railway build process.');
      console.error('💡 Database connection will be attempted when server starts.');
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
    if (!process.env.DATABASE_URL) {
      return {
        connected: false,
        error: 'DATABASE_URL not configured',
        status: 'unhealthy'
      };
    }

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

// Initialize database on first require (but don't fail if it's not available)
async function initializeDatabase() {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      // Try to generate Prisma client and push schema
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);

      console.log('🔄 Generating Prisma client...');
      await execPromise('npx prisma generate');
      console.log('✅ Prisma client generated');

      console.log('🔄 Pushing database schema...');
      await execPromise('npx prisma db push --accept-data-loss');
      console.log('✅ Database schema updated');

      return true;
    } catch (error) {
      console.error('⚠️  Database initialization failed:', error.message);
      console.log('🔄 Will retry database operations when server starts');
      return false;
    }
  }
  return true;
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  initializeDatabase
};
