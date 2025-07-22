const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { checkDatabaseHealth } = require('./config/database');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://task-manager-production-d0dc.up.railway.app',
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Manager API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      database: '/api/db-status'
    }
  });
});

// Health check endpoint with database status
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    res.status(dbHealth.connected ? 200 : 503).json({ 
      status: dbHealth.connected ? 'OK' : 'ERROR',
      message: dbHealth.connected ? 'Server and database are running' : 'Database connection failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbHealth,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json({
      database: dbHealth,
      schema: {
        models: [
          'User', 'Project', 'ProjectMember', 'Task', 
          'Comment', 'TaskMedia', 'CommentMedia', 'ActivityLog'
        ],
        enums: [
          'user_role', 'project_status', 'task_status', 
          'media_type', 'activity_action'
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database status check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/users', require('./routes/users'));

// Copilot route (commented out for now since it was causing issues)
// app.use('/copilotkit', require('./routes/copilotkit'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle Prisma errors specifically
  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      message: 'Database error occurred',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database operation failed',
      code: err.code
    });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = app;