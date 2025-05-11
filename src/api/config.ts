
// API configuration
export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : '/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    SESSION: '/auth/session',
  },
  USERS: {
    PROFILE: '/users/profile',
    TEACHING_SKILLS: '/users/teaching-skills',
    LEARNING_SKILLS: '/users/learning-skills',
    AVAILABILITY: '/users/availability',
    CONNECTIONS: '/users/connections',
  },
  SESSIONS: {
    REQUEST: '/sessions/request',
    ACCEPT: '/sessions/accept',
    DECLINE: '/sessions/decline',
    LIST: '/sessions/list',
  },
  MESSAGES: {
    SEND: '/messages/send',
    LIST: '/messages/list',
    MARK_READ: '/messages/mark-read',
    UNREAD_COUNT: '/messages/unread-count',
  },
  NOTIFICATIONS: {
    LIST: '/notifications/list',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
  SKILLS: {
    LIST: '/skills/list',
    CATEGORIES: '/skills/categories',
  }
};
