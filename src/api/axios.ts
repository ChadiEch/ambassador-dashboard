// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ambassador-tracking-backend-production.up.railway.app', // Replace with your backend base URL
});

// Automatically attach the token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
