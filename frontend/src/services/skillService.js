
import api from './api';

export const skillService = {
  async getTeachingSkills(userId) {
    try {
      const response = await api.get(`/skills/teaching/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting teaching skills:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async getLearningSkills(userId) {
    try {
      const response = await api.get(`/skills/learning/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting learning skills:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async addTeachingSkill(skillData) {
    try {
      const response = await api.post('/skills/teaching', skillData);
      return response.data;
    } catch (error) {
      console.error('Error adding teaching skill:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async addLearningSkill(skillData) {
    try {
      const response = await api.post('/skills/learning', skillData);
      return response.data;
    } catch (error) {
      console.error('Error adding learning skill:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async deleteTeachingSkill(skillId) {
    try {
      const response = await api.delete(`/skills/teaching/${skillId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting teaching skill:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  },
  
  async deleteLearningSkill(skillId) {
    try {
      const response = await api.delete(`/skills/learning/${skillId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting learning skill:', error);
      throw error.response ? error.response.data : { error: 'Network error' };
    }
  }
};
