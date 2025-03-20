import axios from 'axios';

// Membuat instance axios dengan baseURL
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


instance.interceptors.response.use(
  response => response,
  error => {
    if(error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;

// Tambahkan opsi cache untuk Next.js
export const fetchWithCache = async (url: string) => {
  const response = await fetch(url, {
    next: {
      revalidate: 300, // Cache selama 5 menit
    },
  });
  return response.json();
};
