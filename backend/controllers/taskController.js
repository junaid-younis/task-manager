const Task = require('../models/Task');

// Get all tasks with filtering
const getTasks = async (req, res) => {
  try {
    const {
      projectId,
      assignedToId,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await Task.findAll({
      userId,
      isAdmin,
      projectId,
      assignedToId,
      status,
      priority,
      search,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      message: 'Tasks retrieved successfully',
      data: result.tasks,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    
    if (error.message.includes('access denied')) {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error retrieving tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get task by ID
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const task = await Task.findById(id, userId, isAdmin);

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    res.json({
      message: 'Task retrieved successfully',
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      message: 'Error retrieving task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const taskData = req.body;
    const createdById = req.user.id;

    const task = await Task.create(taskData, createdById);

    res.status(201).json({
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message.includes('not a project member')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const task = await Task.update(id, updateData, userId, isAdmin);

    res.json({
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes('not a project member')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await Task.delete(id, userId, isAdmin);

    res.json(result);
  } catch (error) {
    console.error('Delete task error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes('Only project creators')) {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get task statistics
const getTaskStatistics = async (req, res) => {
  try {
    const { projectId } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const statistics = await Task.getStatistics(projectId, userId, isAdmin);

    res.json({
      message: 'Task statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Get task statistics error:', error);
    res.status(500).json({
      message: 'Error retrieving task statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update task status (quick endpoint for status changes)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Validate status
    const validStatuses = ['to_do', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: to_do, in_progress, done' 
      });
    }

    const task = await Task.update(id, { status }, userId, isAdmin);

    res.json({
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error updating task status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatistics,
  updateTaskStatus
};