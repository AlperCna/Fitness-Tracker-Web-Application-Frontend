// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerRequest, setAuthToken } from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            const response = await registerRequest(username, email, password);

            const token = response.data.token;

            // İstersen kayıt sonrası da direkt login yapılmış kabul edebiliriz
            setAuthToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);

            navigate("/dashboard");
        } catch (err) {
            console.error("Register hatası:", err);
            setErrorMsg("Kayıt sırasında bir hata oluştu.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

                {errorMsg && (
                    <p className="text-red-600 text-center mb-3">{errorMsg}</p>
                )}

                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Kullanıcı adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    >
                        Kayıt Ol
                    </button>
                </form>

                <p className="mt-4 text-center text-sm">
                    Zaten hesabın var mı?{" "}
                    <Link to="/login" className="text-blue-600 underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
