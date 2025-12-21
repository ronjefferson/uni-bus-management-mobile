import api from './api';
import { Platform } from 'react-native';

export const sendTokenToBackend = async (token) => {
  try {
    const response = await api.post('notifications/register-device/', {
      fcm_token: token,
      type: Platform.OS
    });
    
    console.log("FCM Token registered successfully:", response.status, response.data);
  
  } catch (error) {
    if (error.response) {
      console.error("Backend Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error (No Response):", error.request);
    } else {
      console.error("Request Setup Error:", error.message);
    }
  }
};