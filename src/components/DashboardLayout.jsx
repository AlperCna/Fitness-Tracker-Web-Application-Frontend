import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Dumbbell,
    NotebookPen,
    LogOut,
    User,
    BarChart2,
    Scale,
    Settings // ✅ İstersen ikon ekleyebilirsin
} from "lucide-react";
import { LogoText } from "./Logo";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Kullanıcı adını alalım
    const userEmail = localStorage.getItem("email") || "Sporcu";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        navigate("/login");
    };

    const menuItems = [
        { path: "/dashboard", name: "Genel Bakış", icon: <LayoutDashboard size={20} /> },
        { path: "/dashboard/exercises", name: "Egzersiz Kütüphanesi", icon: <Dumbbell size={20} /> },
        { path: "/dashboard/workouts", name: "Antrenmanlarım", icon: <NotebookPen size={20} /> },
        { path: "/dashboard/analytics", name: "İstatistikler", icon: <BarChart2 size={20} /> },
        { path: "/dashboard/progress", name: "Gelişim Takibi", icon: <Scale size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50">

            {/* --- SOL MENÜ (SIDEBAR) --- */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl">

                {/* LOGO ALANI */}
                <div className="p-6 border-b border-slate-800 flex items-center">
                    <LogoText color="text-white" />
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}>
                                  {item.icon}
                                </span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* --- ALT KISIM (KULLANICI PROFİLİ) --- */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/50">

                    {/* 🔥 GÜNCELLENDİ: Burası artık Profil Sayfasına giden bir Link */}
                    <Link
                        to="/dashboard/profile"
                        className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
                        title="Profili Düzenle"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <User size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                                {userEmail}
                            </p>
                            <p className="text-xs text-slate-500">Profili Gör →</p>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-2.5 rounded-lg transition-all duration-200 text-sm font-medium border border-red-500/20"
                    >
                        <LogOut size={16} />
                        Güvenli Çıkış
                    </button>
                </div>
            </aside>

            {/* --- ANA İÇERİK --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <h2 className="text-gray-700 font-semibold text-lg">
                        {/* Eğer 'profile' sayfasındaysak başlık doğru görünsün */}
                        {location.pathname === "/dashboard/profile"
                            ? "Kullanıcı Profili"
                            : (menuItems.find(m => m.path === location.pathname)?.name || "Panel")}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                            ● Sistem Online
                        </span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};

export default DashboardLayout;