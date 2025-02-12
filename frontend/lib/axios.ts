import axios from 'axios';

// Membuat instance axios dengan baseURL
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Base URL Laravel API
  headers: {
    'Content-Type': 'application/json', // Menentukan header content type
  },
});

export default axiosInstance;
