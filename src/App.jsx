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
import WorkoutPage from "./pages/WorkoutPage";
import MyWorkouts from "./pages/MyWorkouts";
import EditWorkout from "./pages/EditWorkout";
import Analytics from "./pages/Analytics";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage"; // ✅ 1. IMPORT EKLENDİ

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

                    {/* --- ANTRENMAN ROTALARI --- */}

                    {/* 1. Antrenman Listesi (Geçmiş) */}
                    <Route path="workouts" element={<MyWorkouts />} />

                    {/* 2. Yeni Antrenman Ekleme Sayfası */}
                    <Route path="workouts/new" element={<WorkoutPage />} />

                    {/* 3. Antrenman Düzenleme Sayfası (Dinamik ID alır) */}
                    <Route path="workouts/edit/:id" element={<EditWorkout />} />

                    {/* --- İSTATİSTİK VE GELİŞİM --- */}

                    {/* Genel Analizler */}
                    <Route path="analytics" element={<Analytics />} />

                    {/* Gelişim Takibi */}
                    <Route path="progress" element={<ProgressPage />} />

                    {/* ✅ 2. ROTA EKLENDİ: Profil Sayfası */}
                    <Route path="profile" element={<ProfilePage />} />

                </Route>
            </Route>

            {/* Bilinmeyen bir adrese giderse Login'e at */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;