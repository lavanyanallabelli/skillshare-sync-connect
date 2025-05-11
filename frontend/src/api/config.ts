
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.skillsync.com/api' 
  : 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update'
  },
  NOTIFICATIONS: {
    GET: '/notifications',
    READ: '/notifications/read',
    READ_ALL: '/notifications/read-all'
  },
  MESSAGES: {
    GET: '/messages',
    SEND: '/messages/send',
    UNREAD: '/messages/unread-count'
  }
};
