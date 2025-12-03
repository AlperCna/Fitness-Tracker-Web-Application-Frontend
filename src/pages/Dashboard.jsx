
// src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const email = localStorage.getItem("email") || "Bilinmeyen kullanıcı";

    const handleLogout = () => {
        // Token ve email temizlenir
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        setAuthToken(null);

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-blue-600">
                        Fitness Tracker Dashboard
                    </h1>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                <p className="text-gray-700 mb-2">
                    Hoş geldin, <span className="font-semibold">{email}</span>
                </p>

                <p className="text-gray-600">
                    Buraya daha sonra:
                    <br />– Bugünkü antrenmanların,
                    <br />– Kategori/egzersiz listeleri,
                    <br />– İlerleme grafikleri (Recharts)
                    <br />
                    gibi özellikleri ekleyeceğiz.
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
