import axios from "axios";

// Axios instance oluştur
const api = axios.create({
    baseURL: "http://localhost:8080", // Backend adresin
});

// 🔥 INTERCEPTOR (Her isteği yakala ve token ekle)
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

// Login ve Register sayfalarında kullanılan eski fonksiyonlar hata vermesin diye
// boş bir fonksiyon olarak bırakıyoruz (Geriye dönük uyumluluk)
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
    // Backend'de role lazım mı kontrol et, genelde user otomatik atanır
    return api.post("/auth/register", {
        username,
        email,
        password,
        role: ["user"] // Eğer backend role bekliyorsa
    });
};

export default api;