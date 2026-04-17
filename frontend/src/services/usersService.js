import api from './api';

export const usersService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      // If /users endpoint doesn't exist, we'll need to implement it in backend
      console.warn('Users endpoint not available in backend');
      return { users: [] };
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Get user by ID endpoint not available');
      return null;
    }
  },

  // Update user (admin only)
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.warn('Update user endpoint not available');
      return null;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Delete user endpoint not available');
      return null;
    }
  },

  // Toggle user status (admin only)
  toggleUserStatus: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.warn('Toggle user status endpoint not available');
      return null;
    }
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.warn('User stats endpoint not available');
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsersThisMonth: 0
      };
    }
  }
};

export default usersService;
