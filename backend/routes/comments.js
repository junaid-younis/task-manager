const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  getTaskComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  getCommentStatistics,
  getRecentComments
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

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

// Comment validation
const commentValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  body('taskId')
    .isInt({ min: 1 })
    .withMessage('Valid task ID is required'),
  body('parentCommentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent comment ID must be a valid integer')
];

// Comment update validation
const commentUpdateValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters')
];

// ID parameter validation
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid comment ID is required')
];

const taskIdValidation = [
  param('taskId')
    .isInt({ min: 1 })
    .withMessage('Valid task ID is required')
];

// Query parameter validation
const queryValidation = [
  query('taskId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Task ID must be a valid integer'),
  query('projectId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Project ID must be a valid integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// All routes require authentication
router.use(auth);

// Comment routes
router.get('/recent', queryValidation, handleValidationErrors, getRecentComments);
router.get('/statistics', queryValidation, handleValidationErrors, getCommentStatistics);
router.get('/task/:taskId', taskIdValidation, handleValidationErrors, getTaskComments);
router.get('/:id', idValidation, handleValidationErrors, getComment);
router.post('/', commentValidation, handleValidationErrors, createComment);
router.put('/:id', idValidation, commentUpdateValidation, handleValidationErrors, updateComment);
router.delete('/:id', idValidation, handleValidationErrors, deleteComment);

module.exports = router;