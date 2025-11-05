import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
};

// Services API
export const servicesAPI = {
  getAll: (params?: any) => api.get('/services', { params }),
  getById: (id: string) => api.get(`/services/${id}`),
  getMy: () => api.get('/services/my'),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
  toggleFavorite: (id: string) => api.post(`/services/${id}/favorite`),
  getFavorites: () => api.get('/services/favorites'),
};

// Reviews API
export const reviewsAPI = {
  create: (serviceId: string, data: any) => api.post(`/reviews/${serviceId}`, data),
  respond: (id: string, response: string) =>
    api.put(`/reviews/${id}/respond`, { response }),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// Users API
export const usersAPI = {
  getById: (id: string) => api.get(`/users/${id}`),
  getServices: (id: string) => api.get(`/users/${id}/services`),
  getPosts: (id: string, params?: any) => api.get(`/users/${id}/posts`, { params }),
  getReviews: (id: string) => api.get(`/users/${id}/reviews`),
  getNotifications: () => api.get('/users/me/notifications'),
  markNotificationRead: (id: string) =>
    api.put(`/users/me/notifications/${id}/read`),
};

// Posts API
export const postsAPI = {
  create: (data: any) => api.post('/posts', data),
  getFeed: (params?: any) => api.get('/posts/feed', { params }),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingServices: () => api.get('/admin/services/pending'),
  approveService: (id: string) => api.put(`/admin/services/${id}/approve`),
  rejectService: (id: string, reason?: string) =>
    api.put(`/admin/services/${id}/reject`, { reason }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  verifyUser: (id: string) => api.put(`/admin/users/${id}/verify`),
};

export default api;
