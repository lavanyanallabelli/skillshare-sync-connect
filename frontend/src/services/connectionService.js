
import api from './api';

export const connectionService = {
  async getConnections() {
    try {
      const response = await api.get('/connections');
      return response.data;
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async getPendingRequests() {
    try {
      const response = await api.get('/connections/pending');
      return response.data;
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async sendConnectionRequest(recipientId) {
    try {
      const response = await api.post('/connections', {
        recipientId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async respondToRequest(connectionId, accept) {
    try {
      const response = await api.put(`/connections/${connectionId}/respond`, {
        accept
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to connection request:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async removeConnection(connectionId) {
    try {
      const response = await api.delete(`/connections/${connectionId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  }
};
