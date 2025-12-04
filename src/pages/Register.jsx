import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest, setAuthToken } from "../services/api";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const response = await registerRequest(username, email, password);
            const token = response.data.token;

            setAuthToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);

            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setErrorMsg("Kayıt işlemi başarısız. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">

            {/* SOL TARAFI: FORM ALANI */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative">
                <div className="mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Aramıza Katıl! 🚀</h1>
                    <p className="text-slate-500 mt-2">Fitness hedeflerine ulaşmak için ilk adımı at.</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Username Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                placeholder="Adın Soyadın"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Adresi</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                placeholder="ornek@email.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre Oluştur</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-500/30 mt-4 active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Hesap Oluştur"}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Zaten hesabın var mı?{" "}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>

            {/* SAĞ TARAF: GÖRSEL ALANI */}
            <div className="hidden lg:block w-1/2 bg-slate-900 relative">
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
                <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop"
                    alt="Gym Motivation"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-0 left-0 p-16 text-white bg-gradient-to-t from-black/80 to-transparent w-full">
                    <h2 className="text-4xl font-bold mb-4">Harekete Geç.</h2>
                    <p className="text-slate-200 text-lg">"Seni hedeflerine götürecek tek şey, bugün atacağın adımdır."</p>
                </div>
            </div>

        </div>
    );
}

export default Register;