
import api from './api';

export const userService = {
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  }
};
