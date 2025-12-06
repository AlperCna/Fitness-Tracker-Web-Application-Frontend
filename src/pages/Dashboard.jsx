import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyWorkouts } from "../services/workoutService";
import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, YAxis
} from 'recharts';
import {
    Activity, Clock, Calendar, Dumbbell, TrendingUp,
    ArrowRight, Loader2, Plus, Zap, ChevronRight
} from "lucide-react";

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [quote, setQuote] = useState("");
    const [stats, setStats] = useState({
        totalCount: 0,
        totalDuration: 0,
        lastWorkoutDate: "Henüz Yok",
        weeklyData: [],
        recentWorkouts: []
    });

    // Kullanıcı İsmi (Email'den türetme)
    const userEmail = localStorage.getItem("email") || "Sporcu";
    const username = userEmail.split("@")[0].charAt(0).toUpperCase() + userEmail.split("@")[0].slice(1);

    // Motivasyon Sözleri Havuzu
    const motivationQuotes = [
        "Bugün kendini geliştirmek için harika bir gün!",
        "Küçük adımlar büyük değişimler yaratır.",
        "Hiçbir antrenman boşa gitmez.",
        "Süreklilik, başarının anahtarıdır.",
        "Güçlü hissetmek senin hakkın.",
        "Ter akıtmadan zafer kazanılmaz!",
        "Disiplin, ne istediğini asla unutmama sanatıdır."
    ];

    useEffect(() => {
        // 1. Rastgele Söz Seç
        setQuote(motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)]);

        // 2. Verileri Çek
        const fetchData = async () => {
            try {
                const res = await getMyWorkouts();
                const data = res.data;
                calculateDashboardStats(data);
            } catch (err) {
                console.error("Dashboard veri hatası:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- HESAPLAMA MOTORU ---
    const calculateDashboardStats = (data) => {
        // 1. Toplamlar
        const count = data.length;
        const duration = data.reduce((sum, w) => sum + w.duration, 0);

        // 2. Sıralama (En yeniden en eskiye)
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

        // 3. Son Antrenman Tarihi
        let lastDate = "Yok";
        if (sorted.length > 0) {
            const d = new Date(sorted[0].date);
            lastDate = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
        }

        // 4. Mini Grafik Verisi (Son 7 Gün)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const totalDur = data
                .filter(w => w.date.startsWith(dateStr))
                .reduce((sum, w) => sum + w.duration, 0);

            const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
            last7Days.push({ name: dayName, sure: totalDur });
        }

        setStats({
            totalCount: count,
            totalDuration: duration,
            lastWorkoutDate: lastDate,
            weeklyData: last7Days,
            recentWorkouts: sorted.slice(0, 4) // Son 4 kaydı al
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600" size={48}/>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 animate-fadeIn">

            {/* --- ÜST BAŞLIK ALANI --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        Merhaba, {username}! <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-blue-600 font-medium mt-2 flex items-center gap-2 text-sm md:text-base">
                        <Zap size={16} fill="currentColor" /> {quote}
                    </p>
                </div>
                <Link
                    to="/dashboard/workouts/new"
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95"
                >
                    <Plus size={20} /> Antrenman Başlat
                </Link>
            </div>

            {/* --- 1. KPI KARTLARI --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Kart 1: Toplam Seans */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-300 transition-all relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={100} />
                    </div>
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Activity size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Seans</span>
                    </div>
                    <p className="text-4xl font-extrabold text-slate-800 relative z-10">{stats.totalCount}</p>
                </div>

                {/* Kart 2: Toplam Süre */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-emerald-300 transition-all relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock size={100} />
                    </div>
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Süre</span>
                    </div>
                    <p className="text-4xl font-extrabold text-slate-800 relative z-10">
                        {stats.totalDuration} <span className="text-lg font-medium text-slate-400">dk</span>
                    </p>
                </div>

                {/* Kart 3: Son Aktivite */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-orange-300 transition-all relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar size={100} />
                    </div>
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Son Aktivite</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-800 truncate relative z-10">{stats.lastWorkoutDate}</p>
                </div>
            </div>

            {/* --- 2. GRAFİK VE HIZLI ERİŞİM (GRID) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SOL: Grafik (Haftalık Özet) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                            <TrendingUp size={20} className="text-blue-500"/> Son 7 Gün Aktivitesi
                        </h3>
                        <Link to="/dashboard/analytics" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">
                            Detaylı Rapor
                        </Link>
                    </div>

                    <div className="h-64 w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fill: '#94a3b8', fontSize: 12}}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} dk`, 'Süre']}
                                />
                                <Bar dataKey="sure" radius={[6, 6, 0, 0]} barSize={40}>
                                    {stats.weeklyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.sure > 0 ? '#3B82F6' : '#E2E8F0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SAĞ: Hızlı Erişim Kartı (Gradient) */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Arkaplan Efekti */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Hedefine Odaklan 🎯</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Düzenli antrenman yapmak başarının anahtarıdır. Bugün hangi bölgeyi çalıştıracaksın?
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3">
                        <Link to="/dashboard/exercises" className="block w-full bg-white/10 hover:bg-white/20 py-3.5 px-4 rounded-xl text-sm font-medium transition flex items-center justify-between group border border-white/5">
                            Egzersiz Keşfet <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                        </Link>
                        <Link to="/dashboard/workouts" className="block w-full bg-blue-600 hover:bg-blue-700 py-3.5 px-4 rounded-xl text-sm font-medium transition flex items-center justify-between group shadow-lg shadow-blue-900/30">
                            Geçmişi İncele <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- 3. SON AKTİVİTELER (Liste) --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <Clock size={20} className="text-orange-500"/> Son Antrenmanlar
                    </h3>
                    {stats.recentWorkouts.length > 0 && (
                        <Link to="/dashboard/workouts" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1">
                            Tümünü Gör <ChevronRight size={16} />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.recentWorkouts.length > 0 ? (
                        stats.recentWorkouts.map((w) => (
                            <div key={w.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="bg-white p-2 rounded-lg text-slate-500 shadow-sm group-hover:text-blue-600 transition-colors">
                                        <Dumbbell size={18} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                                        {w.duration} dk
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-800">
                                    {new Date(w.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                </p>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    {w.details?.length || 0} Hareket Tamamlandı
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 text-sm mb-4">Henüz kayıt bulunamadı.</p>
                            <Link to="/dashboard/workouts/new" className="text-blue-600 text-sm font-bold hover:underline">
                                İlkini Ekle
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default Dashboard;