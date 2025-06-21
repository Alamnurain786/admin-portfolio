// src/utils/api.js
import axios from 'axios';
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API utility functions
const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) =>
    api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),

  // Blog post endpoints
  getPosts: (page = 1, limit = 10, filters = {}) => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (filters.tag) url += `&tag=${filters.tag}`;
    if (filters.status) url += `&status=${filters.status}`;
    return api.get(url);
  },
  getPost: (id) => api.get(`/posts/${id}`),
  getPostByPermalink: (permalink) =>
    api.get(`/posts/by-permalink/${permalink}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  batchUpdatePosts: (ids, updateData) =>
    api.put('/posts/batch', { ids, updateData }),

  // Gallery management
  uploadImage: (formData, config) =>
    api.post('/upload/image', formData, {
      ...config,
    }),

  getAllImages: () => api.get('/upload/images'),
  deleteImage: (publicId) => api.delete(`/upload/image/${publicId}`),

  // Projects endpoints
  getProjects: () => api.get('/projects'),
  getProjectById: (id) => api.get(`/projects/${id}`), // Add if missing
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),

  // Skills endpoints
  getSkills: () => api.get('/skills'),
  getSkillById: (id) => api.get(`/skills/${id}`), // Add if missing
  createSkill: (skillData) => api.post('/skills', skillData),
  updateSkill: (id, skillData) => api.put(`/skills/${id}`, skillData),
  deleteSkill: (id) => api.delete(`/skills/${id}`),

  // Certifications endpoints
  getCertifications: () => api.get('/certifications'),
  getCertificationById: (id) => api.get(`/certifications/${id}`), // Add if missing
  createCertification: (certData) => api.post('/certifications', certData),
  updateCertification: (id, certData) =>
    api.put(`/certifications/${id}`, certData),
  deleteCertification: (id) => api.delete(`/certifications/${id}`),

  // Users endpoints (New - adjust based on your API)
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserDetails: (id, userData) => api.put(`/users/${id}`, userData), // For general updates
  deleteUser: (id) => api.delete(`/users/${id}`), // Or toggle status if preferred
  updateUser: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),

  // Settings endpoint (New)
  getSettings: () => api.get('/settings'),
  updateSettings: (settingsData) => api.put('/settings', settingsData),
  updateProfileImageReference: (imageData) =>
    api.put('/settings/about/profile-image', imageData),
  deleteProfileImage: () => api.delete('/settings/about/profile-image'),

  // Gallery management
  getAllImages: () => api.get('/upload/images'),
  deleteImage: (publicId) => api.delete(`/upload/image/${publicId}`),

  // Notification endpoints
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/read-all'),

  // Dashboard
  getTotalBlogPostsCount: () => api.get('/stats/posts/count'), // New: Call the dedicated posts count endpoint
  getTotalUsersCount: () => api.get('/stats/users/count'),
  getDashboardStats: () => api.get('/dashboard/stats'),

  // Contact Messages endpoints
  getContactMessages: (params) => api.get('/contact', { params }), // params: { page, limit, isRead, sort }
  toggleContactMessageReadStatus: (id) =>
    api.patch(`/contact/${id}/toggle-read`),
  deleteContactMessage: (id) => api.delete(`/contact/${id}`),
  getContactMessageById: (id) => api.get(`/contact/${id}`),

  // Activity Log endpoints
  getActivityLogs: (params) => api.get('/activity-logs', { params }), // params: { page, limit, userId, action, entityType, startDate, endDate }
  getActivityLogById: (id) => api.get(`/activity-logs/${id}`),
};

export { api, apiService };
