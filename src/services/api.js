import axios from "axios";

// 🔥 Ortama göre backend URL belirle
const BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:8080"
        : "https://fitness-tracker-web-application.onrender.com";

// Axios instance
const api = axios.create({
    baseURL: BASE_URL,
});

// JWT interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- AUTH ---

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem("token", token);
    } else {
        localStorage.removeItem("token");
    }
};

export const loginRequest = (email, password) =>
    api.post("/auth/login", { email, password });

export const registerRequest = (username, email, password) =>
    api.post("/auth/register", {
        username,
        email,
        password,
        role: ["user"],
    });

// --- PROGRESS ---

export const getProgressLogs = () => api.get("/progress");

export const addProgressLog = (data) =>
    api.post("/progress", data);

export const deleteProgressLog = (id) =>
    api.delete(`/progress/${id}`);

// Default export
export default api;
