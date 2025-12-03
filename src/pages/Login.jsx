import { useState } from "react";
import { loginRequest, setAuthToken } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await loginRequest(email, password);

            const token = response.data.token;

            // Token'ı global axios header'ına ekle
            setAuthToken(token);

            // LocalStorage'a kaydet
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);

            // Dashboard'a yönlendir
            navigate("/dashboard");
        } catch (err) {
            setErrorMsg("Email veya şifre hatalı!");
            console.error("Login hatası:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

                {errorMsg && (
                    <p className="text-red-600 text-center mb-3">{errorMsg}</p>
                )}

                <form onSubmit={handleLogin}>
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
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-3 text-center">
                    Hesabın yok mu?{" "}
                    <a href="/register" className="text-blue-600 underline">
                        Kayıt Ol
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Login;
