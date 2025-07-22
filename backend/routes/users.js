const express = require('express');
const { param, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { prisma } = require('../config/database');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// All routes require authentication
router.use(auth);

// Get all users (for member selection)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    res.json({
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search users by query
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        message: 'Search query too short',
        data: []
      });
    }

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      },
      take: 10
    });

    res.json({
      message: 'Users found',
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Error searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Routes
router.get('/', getAllUsers);
router.get('/search', [
  query('q').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
], handleValidationErrors, searchUsers);

module.exports = router;