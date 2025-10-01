import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

// Authentication service - handles user login, registration, and profile management
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// User management service - CRUD operations for users (admin functionality)
export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStudents: (params) => api.get('/users', { params: { ...params, role: 'student' } }),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Course management service - handles course CRUD and enrollment operations
export const courseService = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  unenrollFromCourse: (courseId) => api.delete(`/courses/${courseId}/enroll`),
  getCourseStudents: (courseId) => api.get(`/courses/${courseId}/students`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getAvailableCourses: () => api.get('/courses/available'),
  uploadSyllabus: (courseId, formData) => api.post(`/courses/${courseId}/syllabus`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Grade management service - handles grade CRUD and student/course specific operations
export const gradeService = {
  getGrades: (params) => api.get('/grades', { params }),
  getGradeById: (id) => api.get(`/grades/${id}`),
  createGrade: (gradeData) => api.post('/grades', gradeData),
  updateGrade: (id, gradeData) => api.put(`/grades/${id}`, gradeData),
  deleteGrade: (id) => api.delete(`/grades/${id}`),
  getStudentGrades: (studentId) => api.get(`/grades/student/${studentId}`),
  getCourseGrades: (courseId) => api.get(`/grades/course/${courseId}`),
  getMyGrades: () => api.get('/grades/my-grades'),
  bulkCreateGrades: (gradesData) => api.post('/grades/bulk', gradesData),
  exportGrades: (params) => api.get('/grades/export', {
    params,
    responseType: 'blob'
  }),
};

// Dashboard service - provides data for admin and student dashboard views
export const dashboardService = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getUpcomingEvents: () => api.get('/dashboard/events'),
};

// Notification service - manages user notifications
export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Generic file upload utility with progress tracking
export const uploadFile = async (endpoint, file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Centralized error handling utility for API responses
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data.message || 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 422:
        return data.message || 'Validation error. Please check your input.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return data.message || `Error ${status}: Something went wrong.`;
    }
  } else if (error.request) {
    // Network error - no response received
    return 'Network error. Please check your internet connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};

export default api;

