
import api from './api';

export const sessionService = {
  async getAllSessions() {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async getSessionById(sessionId) {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting session by ID:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async sendSessionRequest(sessionData) {
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error sending session request:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async respondToSessionRequest(sessionId, accept, meetingLink = null) {
    try {
      const response = await api.put(`/sessions/${sessionId}/respond`, {
        accept,
        meetingLink
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to session request:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  }
};
