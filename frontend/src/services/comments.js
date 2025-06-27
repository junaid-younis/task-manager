import api from './api';

export const commentService = {
  // Get task comments
  getTaskComments: async (taskId) => {
    try {
      const response = await api.get(`/comments/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Get comment by ID
  getComment: async (id) => {
    try {
      const response = await api.get(`/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comment:', error);
      throw error;
    }
  },

  // Create comment
  createComment: async (commentData) => {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (id, commentData) => {
    try {
      const response = await api.put(`/comments/${id}`, commentData);
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (id) => {
    try {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Get recent comments
  getRecentComments: async (params = {}) => {
    try {
      const response = await api.get('/comments/recent', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent comments:', error);
      throw error;
    }
  },

  // Get comment statistics
  getCommentStatistics: async (params = {}) => {
    try {
      const response = await api.get('/comments/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comment statistics:', error);
      throw error;
    }
  }
};