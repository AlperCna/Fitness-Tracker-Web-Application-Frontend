import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, setAuthToken } from "../services/api";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { LogoText } from "../components/Logo";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [errorShake, setErrorShake] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        setAuthToken(null);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const response = await loginRequest(email, password);
            const token = response.data.token;

            setAuthToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);

            navigate("/dashboard");
        } catch (err) {
            setErrorMsg("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
            setErrorShake(true);
            setTimeout(() => setErrorShake(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-900 fade-in">

            {/* SOL TARAF - FORM */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32">

                <div className="mb-10 fade-in">
                    <LogoText />
                    <h1 className="text-3xl font-bold text-white mt-3">Tekrar Hoş Geldin! 👋</h1>
                    <p className="text-slate-400 mt-2">
                        Gelişimini takip etmek için hesabına giriş yap.
                    </p>
                </div>

                {/* HATA MESAJI */}
                {errorMsg && (
                    <div
                        className={`mb-4 p-4 bg-red-500/20 text-red-300 text-sm rounded-lg border border-red-500/40 ${
                            errorShake ? "shake" : ""
                        }`}
                    >
                        ⚠️ {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Email Adresi
                        </label>
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute inset-y-0 left-0 ml-3 mt-3 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 text-white border border-slate-700 rounded-xl
                                           input-glow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ornek@email.com"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Şifre
                        </label>
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute inset-y-0 left-0 ml-3 mt-3 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 text-white border border-slate-700 rounded-xl
                                           input-glow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex justify-end mt-1">
                            <a
                                href="#"
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                Şifremi Unuttum?
                            </a>
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl
                                   transition-all duration-200 flex items-center justify-center gap-2 btn-3d
                                   shadow-lg shadow-blue-700/30 active:scale-95"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            "Giriş Yap"
                        )}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Hesabın yok mu?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                    >
                        Hemen kayıt ol
                    </Link>
                </p>
            </div>

            {/* SAĞ TARAF - ARKA PLAN */}
            <div className="hidden lg:block w-1/2 bg-slate-900 relative">
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>

                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                    alt="Fitness Motivation"
                    className="w-full h-full object-cover opacity-90"
                />

                <div className="absolute bottom-0 left-0 p-16 text-white bg-gradient-to-t from-black/80 to-transparent w-full">
                    <h2 className="text-4xl font-bold mb-4">Sınırlarını Zorla.</h2>
                    <p className="text-slate-200 text-lg">
                        "Gelişimini takip etmediğin sürece ne kadar ilerlediğini bilemezsin."
                    </p>
                </div>
            </div>

        </div>
    );
}

export default Login;
