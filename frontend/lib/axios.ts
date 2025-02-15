import axios from 'axios';

// Membuat instance axios dengan baseURL
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Base URL Laravel API
  headers: {
    'Content-Type': 'application/json', // Menentukan header content type
  },
});

// Add request interceptor to add token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
