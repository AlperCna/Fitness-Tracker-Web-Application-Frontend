import axios from "axios";

// 1. Axios instance oluştur
const api = axios.create({
    baseURL: "http://localhost:8080", // Backend adresin
});

// 2. INTERCEPTOR (Her isteği yakala ve token ekle)
api.interceptors.request.use(
    (config) => {
        // Tarayıcı hafızasından token'ı al
        const token = localStorage.getItem("token");

        // Eğer token varsa, header'a ekle
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- AUTH (Giriş/Kayıt) İŞLEMLERİ ---

// Token yönetimi (Geriye dönük uyumluluk için)
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem("token", token);
    } else {
        localStorage.removeItem("token");
    }
};

// Login İsteği
export const loginRequest = (email, password) => {
    return api.post("/auth/login", { email, password });
};

// Register İsteği
export const registerRequest = (username, email, password) => {
    return api.post("/auth/register", {
        username,
        email,
        password,
        role: ["user"] // Opsiyonel
    });
};

// --- 🔥 YENİ EKLENENLER: PROGRESS (GELİŞİM) SERVİSLERİ ---

// Geçmiş kayıtları getir (GET)
export const getProgressLogs = () => {
    return api.get("/progress");
};

// Yeni kilo kaydı ekle (POST)
// data formatı: { weight: 75.5, date: "2025-12-08" }
export const addProgressLog = (data) => {
    return api.post("/progress", data);
};

// Kayıt sil (DELETE)
export const deleteProgressLog = (id) => {
    return api.delete(`/progress/${id}`);
};

// Default export (api instance'ı)
export default api;