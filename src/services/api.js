import axios from 'axios';
import { router } from 'expo-router';

const BASE_URL = 'https://1f6ba547aa10.ngrok-free.app/api/'; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
   
    if (originalRequest.url.includes('/login/') || originalRequest.url.includes('/token/')) {
        return Promise.reject(error);
    }
   

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post('api/token/refresh/'); 
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Session expired:", refreshError);
        await SecureStore.deleteItemAsync('user_role');
        
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        
      
        router.replace('/(auth)');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default api;