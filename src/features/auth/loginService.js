import api from '../../services/api';
import * as SecureStore from 'expo-secure-store';

const studentLogin = async (studentEmail) => {
    const response = await api.post('students/demo-login/', {
        email: studentEmail
    });

    if (response.data.role) {
        await SecureStore.setItemAsync('user_role', response.data.role);
    }

    return response.data;
};

const userLogin = async (username, password) => {
    const response = await api.post('token/', {
        username,
        password
    });

    if (response.data.role) {
        await SecureStore.setItemAsync('user_role', response.data.role);
    }

    return response.data;
};

const logout = async () => {
    try {
        const response = await api.post('token/logout/');
        return response.data;
    } finally {
        await SecureStore.deleteItemAsync('user_role');
    }
}

export const registerParent = async (payload) => {
  try {
    const response = await api.post('parents/register/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { studentLogin, userLogin, logout };