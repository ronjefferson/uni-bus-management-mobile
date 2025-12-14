import api from '../../services/api.js';


const studentLogin = async (studentEmail) => {
    const response = await api.post('students/demo-login/', {
        email: studentEmail
    });

    return response.data;
};

const userLogin = async (username, password) => {
    const response = await api.post('token/', {
        username,
        password
    });

    return response.data;
};

const logout = async () => {
    const response = await api.post('token/logout/');

    return response.data;
}

export { studentLogin, userLogin, logout };