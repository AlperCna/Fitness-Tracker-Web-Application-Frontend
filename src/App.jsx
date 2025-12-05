import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { setAuthToken } from "./services/api";

// Bileşenler
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Sayfalar
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ExerciseLibrary from "./pages/ExerciseLibrary"; // ✅ YENİ: Dosyayı içeri aldık

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
                <Route path="/dashboard" element={<DashboardLayout />}>

                    {/* /dashboard adresine gelince Dashboard.jsx (İstatistikler) açılsın */}
                    <Route index element={<Dashboard />} />

                    {/* ✅ YENİ ROUTE: Egzersiz Kütüphanesi Sayfası */}
                    {/* Tarayıcıda /dashboard/exercises adresine gidince burası açılacak */}
                    <Route path="exercises" element={<ExerciseLibrary />} />

                </Route>
            </Route>

            {/* Bilinmeyen bir adrese giderse Login'e at */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;