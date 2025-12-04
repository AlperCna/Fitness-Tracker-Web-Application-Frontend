import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    // 1. Tarayıcının hafızasından (localStorage) token'ı alıyoruz
    const token = localStorage.getItem("token");

    // 2. Eğer token varsa (<Outlet />) yani istenen sayfayı göster
    // 3. Token yoksa (<Navigate />) ile Login sayfasına postala
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;