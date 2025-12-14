import api from '../../services/api.js';

export const getMyChildren = async () => {
  try {
    const response = await api.get('parents/me/children/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChildLogs = async (studentId, filters = {}) => {
  try {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        params[key] = filters[key];
      }
    });

    const response = await api.get(`parents/me/children/${studentId}/logs/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getParentProfile = async () => {
  try {
    const response = await api.get('parents/me/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const linkStudentAccount = async (payload) => {
  try {
    const response = await api.post('parents/me/link-child/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};