import api from '../../services/api.js';

export const getAdminStudents = async (search = '') => {
  try {
    const params = search ? { search } : {};
    
    const response = await api.get('admin/students/', { params });
    
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdminParents = async (search = '') => {
  try {
    const params = search ? { search } : {};
    const response = await api.get('admin/parents/', { params });
    
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPendingRequests = async () => {
  try {
    const response = await api.get('admin/requests/');
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveRequest = async (id, payload) => {
  try {
    const response = await api.post(`admin/requests/${id}/approve/`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectRequest = async (id) => {
  try {
    const response = await api.post(`admin/requests/${id}/reject/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentReport = async (day) => {
  try {
    const params = day ? { day } : {};
    const response = await api.get('admin/student-report/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdminScanLogs = async (filters = {}) => {
  try {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        params[key] = filters[key];
      }
    });
    const response = await api.get('admin/scan-logs/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};