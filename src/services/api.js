import axios from 'axios';
import { router } from 'expo-router';

const BASE_URL = 'https://c6dbb69cdbf4.ngrok-free.app/api/'; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      originalRequest._retry = true;

      try {
        await api.post('token/refresh/');

        return api(originalRequest);

      } catch (refreshError) {
        router.replace('/(auth)'); 
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default api;