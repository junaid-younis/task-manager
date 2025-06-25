import api from './api';

export const userService = {
  // Get all users (for member selection)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Search users by email or username
  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};