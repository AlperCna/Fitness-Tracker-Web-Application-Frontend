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
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutPage from "./pages/WorkoutPage"; // ✅ YENİ EKLENDİ

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

                    {/* Egzersiz Kütüphanesi */}
                    <Route path="exercises" element={<ExerciseLibrary />} />

                    {/* ✅ YENİ ROTALAR: ANTRENMANLAR */}

                    {/* 1. Antrenman Listesi (Sidebar'a tıklayınca burası açılır - Şimdilik boş) */}
                    <Route path="workouts" element={
                        <div className="p-10 text-center">
                            <h2 className="text-xl font-bold mb-4">Antrenman Geçmişi</h2>
                            <p className="text-slate-500 mb-4">Geçmiş antrenmanların burada listelenecek.</p>
                            <a href="/dashboard/workouts/new" className="bg-blue-600 text-white px-4 py-2 rounded">
                                + Yeni Antrenman Ekle
                            </a>
                        </div>
                    } />

                    {/* 2. Antrenman Ekleme Sayfası (Asıl yaptığımız sayfa) */}
                    <Route path="workouts/new" element={<WorkoutPage />} />

                </Route>
            </Route>

            {/* Bilinmeyen bir adrese giderse Login'e at */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;