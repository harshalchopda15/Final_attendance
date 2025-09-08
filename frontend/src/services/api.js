import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      const isAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/signup');
      const onLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

      // For auth failures on login/signup or when already on login page, do not redirect
      if (!isAuthEndpoint && !onLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Teacher API calls
export const teacherAPI = {
  generateQR: (classData) => api.post('/teacher/generate-qr', classData),
  getClasses: () => api.get('/teacher/classes'),
  getClassAttendance: (classId) => api.get(`/teacher/attendance/${classId}`),
  getRealTimeAttendance: () => api.get('/teacher/realtime-attendance'),
  addStudentAttendance: (classId, studentEmail) => api.post(`/teacher/attendance/${classId}/add-student`, { studentEmail }),
};

// Student API calls
export const studentAPI = {
  markAttendance: (qrData) => api.post('/student/mark-attendance', qrData),
  getAttendance: () => api.get('/student/attendance'),
  getRecentClasses: () => api.get('/student/recent-classes'),
};

// Admin API calls
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getReports: () => api.get('/admin/reports'),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
