const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMembers
} = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

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

// Project validation
const projectValidation = [
  body('name')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
];

// Member validation
const memberValidation = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required')
];

// ID parameter validation
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required')
];

const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required')
];

// All routes require authentication
router.use(auth);

// Project CRUD routes
router.get('/', getProjects);
router.get('/:id', idValidation, handleValidationErrors, getProject);
router.post('/', projectValidation, handleValidationErrors, createProject);
router.put('/:id', idValidation, projectValidation, handleValidationErrors, updateProject);
router.delete('/:id', idValidation, handleValidationErrors, deleteProject);

// Member management routes
router.get('/:id/members', idValidation, handleValidationErrors, getMembers);
router.post('/:id/members', idValidation, memberValidation, handleValidationErrors, addMember);
router.delete('/:id/members/:userId', idValidation, userIdValidation, handleValidationErrors, removeMember);

module.exports = router;    