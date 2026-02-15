import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cloud-box-iota.vercel.app/api/v1',
  // baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
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

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Specifically check for "User is already registered" message (and legacy typo)
    // If found, just pass the error through so frontend can display toast
    if (error.response && error.response.status === 401) {
       const msg = error.response.data?.message;
       if (msg === "User is Registerd already" || msg === "User is Registered already" || msg === "Invalid OTP") {
           return Promise.reject(error);
       }

       // Otherwise standard auth failure -> clear storage and redirect
      if (typeof window !== 'undefined') { // basic check for environment
          // Clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // preventing infinite loop if already on login
          if (!window.location.pathname.includes('/login')) {
             window.location.href = '/login';
          }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
