
import api from './api';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error in register:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  },
  
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  getToken() {
    return localStorage.getItem('token');
  },
  
  getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};
