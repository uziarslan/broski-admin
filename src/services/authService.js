import axiosInstance from "./axiosInstance";

const API_URL = "/api/auth";

// 👇 Util to notify extension
const notifyExtensionWithToken = (token) => {
    try {
        window.postMessage({ type: "FROM_WEB_TO_EXTENSION", token }, "*");
    } catch (err) {
        console.warn("Failed to notify extension:", err);
    }
};

const register = async (userData) => {
    const response = await axiosInstance.post(
        `${API_URL}/user/signup`,
        userData
    );
    if (response.data) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        notifyExtensionWithToken(token);
    }
    return response;
};

const login = async (userData) => {
    const response = await axiosInstance.post(`${API_URL}/user/login`, userData);
    if (response.data) {
        const token = response.data.token;
        localStorage.setItem("token", token);
    }
    return response;
};

const logout = () => {
    localStorage.removeItem("token");
};

const getUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
        const response = await axiosInstance.get(`${API_URL}/user`);
        return response.data;
    }
    return null;
};

const googleLogin = async (credentialResponse) => {
    const response = await axiosInstance.post(`${API_URL}/google-login`, {
        token: credentialResponse.credential
    });
    if (response.data) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        notifyExtensionWithToken(token);
    }
    return response;
}

const authService = {
    register,
    login,
    logout,
    getUser,
    googleLogin
};

export default authService;