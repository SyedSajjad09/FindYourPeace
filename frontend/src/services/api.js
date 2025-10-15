import axios from 'axios';

// Use environment variable for API URL, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Get all available feelings/emotional states
   */
  async getFeelings() {
    try {
      const response = await api.get('/feelings');
      return response.data;
    } catch (error) {
      console.error('Error fetching feelings:', error);
      throw error;
    }
  },

  /**
   * Get a verse for a specific feeling
   * @param {string} feelingId - The ID of the selected feeling
   * @param {string} userId - Optional user ID for history tracking
   * @param {string[]} excludeVerses - Array of verse references to exclude
   */
  async getVerse(feelingId, userId = null, excludeVerses = []) {
    try {
      const response = await api.post('/verse', {
        feeling_id: feelingId,
        user_id: userId,
        exclude_verses: excludeVerses,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  },

  /**
   * Get API statistics
   */
  async getStats() {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const healthURL = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '/health')
        : 'http://localhost:8000/health';
      const response = await axios.get(healthURL);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};

export default apiService;
