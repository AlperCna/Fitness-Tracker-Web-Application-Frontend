import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { setAuthToken } from "./services/api";

// 1. Yeni oluşturduğumuz bileşenleri içeri alıyoruz
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Sayfalar
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {

    // Sayfa yenilenince token gitmesin diye yapılan ayar
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
        }
    }, []);

    return (
        <Routes>
            {/* Giriş yapmamış biri ana sayfaya gelirse Login'e gitsin */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🔒 GÜVENLİK DUVARI (ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>

                {/* 🎨 TASARIM İSKELETİ (DashboardLayout) */}
                {/* Tüm yönetim paneli sayfaları bu layout'un içinde açılacak */}
                <Route path="/dashboard" element={<DashboardLayout />}>

                    {/* /dashboard adresine gelince Dashboard.jsx (İstatistikler) açılsın */}
                    <Route index element={<Dashboard />} />

                    {/* İleride buraya başka sayfalar da ekleyeceğiz:
                        Örn: <Route path="exercises" element={<Exercises />} />
                    */}

                </Route>
            </Route>

            {/* Bilinmeyen bir adrese giderse Login'e at */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;