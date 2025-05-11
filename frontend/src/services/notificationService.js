
import api from './api';

export const notificationService = {
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async createNotification(notificationData) {
    try {
      const response = await api.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  }
};
