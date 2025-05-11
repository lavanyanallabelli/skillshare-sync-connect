
import axios from 'axios';
import { API_BASE_URL } from './config';

export const APIClient = {
  get: async <T>(endpoint: string, params?: any): Promise<T> => {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
    return response.data;
  },

  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
    return response.data;
  },

  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await axios.put(`${API_BASE_URL}${endpoint}`, data);
    return response.data;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await axios.delete(`${API_BASE_URL}${endpoint}`);
    return response.data;
  }
};
