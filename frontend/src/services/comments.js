import api from './api';

export const commentService = {
  // Get task comments
  getTaskComments: async (taskId) => {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  },

  // Get comment by ID
  getComment: async (id) => {
    const response = await api.get(`/comments/${id}`);
    return response.data;
  },

  // Create comment
  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  // Update comment
  updateComment: async (id, commentData) => {
    const response = await api.put(`/comments/${id}`, commentData);
    return response.data;
  },

  // Delete comment
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  // Get recent comments
  getRecentComments: async (params = {}) => {
    const response = await api.get('/comments/recent', { params });
    return response.data;
  },

  // Get comment statistics
  getCommentStatistics: async (params = {}) => {
    const response = await api.get('/comments/statistics', { params });
    return response.data;
  }
};