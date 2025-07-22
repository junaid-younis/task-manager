require('dotenv').config();
const app = require('./app');
const { connectDatabase, disconnectDatabase, initializeDatabase } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

async function startServer() {
  try {
    console.log('🚀 Starting Task Manager API...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    console.log('Database URL configured:', !!process.env.DATABASE_URL);
    
    // Initialize database at runtime (not during build)
    if (process.env.DATABASE_URL) {
      console.log('🔄 Initializing database...');
      await initializeDatabase();
      
      // Connect to database
      const dbConnected = await connectDatabase();
      if (!dbConnected) {
        console.warn('⚠️  Database connection failed, but server will start anyway');
        console.log('🔄 Database operations will be retried on first request');
      }
    } else {
      console.warn('⚠️  DATABASE_URL not set. Database features will be unavailable.');
    }
    
    // Start server regardless of database status
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API docs: http://localhost:${PORT}/`);
      
      if (process.env.DATABASE_URL) {
        console.log(`🔗 Database status: http://localhost:${PORT}/api/db-status`);
      }
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });

    // Prevent server timeout
    server.timeout = 0;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
