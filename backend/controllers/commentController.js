const Comment = require('../models/Comment');

// Get all comments for a task
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const comments = await Comment.findByTask(taskId, userId, isAdmin);

    res.json({
      message: 'Comments retrieved successfully',
      data: comments
    });
  } catch (error) {
    console.error('Get task comments error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error retrieving comments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get comment by ID
const getComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const comment = await Comment.findById(id, userId, isAdmin);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or access denied' });
    }

    res.json({
      message: 'Comment retrieved successfully',
      data: comment
    });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({
      message: 'Error retrieving comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create comment
const createComment = async (req, res) => {
  try {
    const commentData = req.body;
    const userId = req.user.id;

    const comment = await Comment.create(commentData, userId);

    res.status(201).json({
      message: 'Comment created successfully',
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error creating comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const comment = await Comment.update(id, updateData, userId, isAdmin);

    res.json({
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error updating comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await Comment.delete(id, userId, isAdmin);

    res.json(result);
  } catch (error) {
    console.error('Delete comment error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes('Cannot delete comment with replies')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error deleting comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get comment statistics
const getCommentStatistics = async (req, res) => {
  try {
    const { taskId, projectId } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const statistics = await Comment.getStatistics(taskId, projectId, userId, isAdmin);

    res.json({
      message: 'Comment statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Get comment statistics error:', error);
    res.status(500).json({
      message: 'Error retrieving comment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get recent comments
const getRecentComments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const comments = await Comment.getRecentComments(parseInt(limit), userId, isAdmin);

    res.json({
      message: 'Recent comments retrieved successfully',
      data: comments
    });
  } catch (error) {
    console.error('Get recent comments error:', error);
    res.status(500).json({
      message: 'Error retrieving recent comments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getTaskComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  getCommentStatistics,
  getRecentComments
};