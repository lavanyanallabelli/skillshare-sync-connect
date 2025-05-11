
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.skillsync.com/api' 
  : 'http://localhost:5000/api';
