// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

// Token'ı tüm isteklerde kullanmak için header'a ekler
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

// LOGIN isteği
export const loginRequest = (email, password) => {
    return api.post("/auth/login", { email, password });
};

// REGISTER isteği
export const registerRequest = (username, email, password) => {
    return api.post("/auth/register", { username, email, password });
};

export default api;
