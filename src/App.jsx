// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { setAuthToken } from "./services/api";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
    // Sayfa yenilense bile token varsa axios header'a tekrar koy
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
        }
    }, []);

    // Basit korumalı route bileşeni
    const RequireAuth = ({ children }) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <Routes>
            {/* Ana sayfa → login'e yönlendir */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/dashboard"
                element={
                    <RequireAuth>
                        <Dashboard />
                    </RequireAuth>
                }
            />

            {/* Tanımsız route'lar da login'e gitsin */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
