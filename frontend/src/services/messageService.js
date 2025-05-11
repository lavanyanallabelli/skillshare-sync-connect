
import api from './api';

export const messageService = {
  async getConversations() {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async getMessages(partnerId) {
    try {
      const response = await api.get(`/messages/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async sendMessage(receiverId, content) {
    try {
      const response = await api.post('/messages', {
        receiverId,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async getUnreadCount() {
    try {
      const response = await api.get('/messages/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  }
};
