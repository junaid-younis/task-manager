const Project = require('../models/Project');

// Get all projects
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await Project.findAll({
      userId,
      isAdmin,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      message: 'Projects retrieved successfully',
      data: result.projects,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      message: 'Error retrieving projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project by ID
const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const project = await Project.findById(id, userId, isAdmin);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project retrieved successfully',
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      message: 'Error retrieving project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdById = req.user.id;

    const project = await Project.create({ name, description }, createdById);

    res.status(201).json({
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      message: 'Error creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const project = await Project.update(id, updateData, userId, isAdmin);

    res.json({
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    
    if (error.message === 'Project not found or access denied') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error updating project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await Project.delete(id, userId, isAdmin);

    res.json(result);
  } catch (error) {
    console.error('Delete project error:', error);
    
    if (error.message === 'Project not found or access denied') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error deleting project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const addedById = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const member = await Project.addMember(id, userId, addedById, isAdmin);

    res.status(201).json({
      message: 'Member added successfully',
      data: member
    });
  } catch (error) {
    console.error('Add member error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes('already a member')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error adding member',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Remove member from project
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const removedById = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await Project.removeMember(id, userId, removedById, isAdmin);

    res.json(result);
  } catch (error) {
    console.error('Remove member error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error removing member',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project members
const getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const members = await Project.getMembers(id, userId, isAdmin);

    res.json({
      message: 'Members retrieved successfully',
      data: members
    });
  } catch (error) {
    console.error('Get members error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error retrieving members',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMembers
};