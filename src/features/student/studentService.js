import api from '../../services/api.js';

const getStudentInfo = async () => {
    try {
        const response = await api.get('students/me/');

        return response.data;
    }
    catch(error) {
        throw(error);
    }
};

const getStudentSchedule = async () => {
    try {
        const response = await api.get('students/schedule/');

        return response.data;
    }
    catch(error) {
        throw(error);
    }
}

const getStudentScanHistory = async (filters = {}) => {
  try { 
    const response = await api.get('students/me/logs/', { params: filters });
    return response.data;
  } 
  catch (error) {
    throw error;
  }
};

const getConnectedAccounts = async () => {
  try {
    const response = await api.get('students/me/parents/');
    return response.data
  }
  catch(error) {
    throw error;
  }
};

const getStudentRequests = async ( filters = {}) => {
  try {
    const response = await api.get('students/requests/', { params: filters });
    return response.data;
  }
  catch(error) {
    throw error;
  }
}


const createStudentRequest = async (payload) => {
  try {
    const response = await api.post('students/requests/', payload);
    return response.data;
  }
  catch(error) {
    throw error;
  }
};

export { getStudentInfo, getStudentSchedule, getStudentScanHistory, getConnectedAccounts, getStudentRequests, createStudentRequest };