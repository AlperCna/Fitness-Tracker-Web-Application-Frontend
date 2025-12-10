import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyWorkouts } from "../services/workoutService";
import { getProgressLogs } from "../services/api";
import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, YAxis
} from 'recharts';
import {
    Activity, Clock, Calendar, Dumbbell, TrendingUp,
    ArrowRight, Loader2, Plus, Zap, ChevronRight, Scale
} from "lucide-react";

// --- YARDIMCI BİLEŞEN: SAYI SAYMA ANİMASYONU ---
const CountUp = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = currentTime - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (yavaşça durma efekti)
            const easeOutQuad = (t) => t * (2 - t);

            setCount(easeOutQuad(percentage) * end);

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    // Ondalıklı sayıysa (örn: kilo) formatla, değilse düz yaz
    const displayValue = Number.isInteger(end)
        ? Math.floor(count)
        : count.toFixed(1);

    return <span>{displayValue}{suffix}</span>;
};

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [quote, setQuote] = useState("");
    const [stats, setStats] = useState({
        totalCount: 0,
        totalDuration: 0,
        lastWorkoutDate: "Henüz Yok",
        currentWeight: 0, // Sayı animasyonu için 0 başlattık
        weeklyData: [],
        recentWorkouts: []
    });

    const userEmail = localStorage.getItem("email") || "Sporcu";
    const username = userEmail.split("@")[0].charAt(0).toUpperCase() + userEmail.split("@")[0].slice(1);

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
        setQuote(motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)]);

        const fetchData = async () => {
            try {
                const [workoutRes, progressRes] = await Promise.all([
                    getMyWorkouts(),
                    getProgressLogs()
                ]);
                calculateDashboardStats(workoutRes.data, progressRes.data);
            } catch (err) {
                console.error("Dashboard veri hatası:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateDashboardStats = (workouts, progressLogs) => {
        // 1. Toplamlar
        const count = workouts.length;
        const duration = workouts.reduce((sum, w) => sum + w.duration, 0);

        // 2. Sıralama
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const sortedProgress = [...progressLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

        // 3. Son Antrenman
        let lastDate = "Yok";
        if (sortedWorkouts.length > 0) {
            const d = new Date(sortedWorkouts[0].date);
            lastDate = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
        }

        // 4. Mevcut Kilo
        let weight = 0; // Varsayılan sayısal değer
        if (sortedProgress.length > 0) {
            weight = sortedProgress[0].weight;
        }

        // 5. Haftalık Grafik
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const totalDur = workouts
                .filter(w => w.date.startsWith(dateStr))
                .reduce((sum, w) => sum + w.duration, 0);

            const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
            last7Days.push({ name: dayName, sure: totalDur });
        }

        setStats({
            totalCount: count,
            totalDuration: duration,
            lastWorkoutDate: lastDate,
            currentWeight: weight,
            weeklyData: last7Days,
            recentWorkouts: sortedWorkouts.slice(0, 4)
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={48}/>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 animate-fadeIn">

            {/* --- PREMIUM HEADER --- */}
            <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-2xl text-white">
                {/* Arkaplan Efektleri */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-2">
                            <Activity size={16} /> Performans Raporu
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Hoş Geldin, {username}! 👋
                        </h1>
                        <p className="text-slate-300 mt-2 flex items-center gap-2 text-lg font-light">
                            "{quote}"
                        </p>
                    </div>

                    <Link
                        to="/dashboard/workouts/new"
                        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg flex items-center gap-2 active:scale-95 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform"/>
                        Antrenman Başlat
                    </Link>
                </div>
            </div>

            {/* --- 1. KPI KARTLARI (Hover Efektli) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Kart 1: Toplam Seans */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">GENEL</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Seans</p>
                    <p className="text-4xl font-extrabold text-slate-800 mt-1">
                        <CountUp end={stats.totalCount} />
                    </p>
                </div>

                {/* Kart 2: Toplam Süre */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">DAKİKA</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Süre</p>
                    <p className="text-4xl font-extrabold text-slate-800 mt-1">
                        <CountUp end={stats.totalDuration} />
                    </p>
                </div>

                {/* Kart 3: Son Aktivite */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">TARİH</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Son Aktivite</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-2 truncate">
                        {stats.lastWorkoutDate}
                    </p>
                </div>

                {/* Kart 4: Mevcut Kilo */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Scale size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">GÜNCEL</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mevcut Kilo</p>
                    <p className="text-4xl font-extrabold text-slate-800 mt-1">
                        {stats.currentWeight > 0 ? <CountUp end={stats.currentWeight} suffix=" kg" /> : "-"}
                    </p>
                </div>

            </div>

            {/* --- 2. GRAFİK VE HIZLI ERİŞİM --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SOL: Grafik */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                            <TrendingUp size={20} className="text-blue-600"/> Son 7 Gün Aktivitesi
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

                {/* SAĞ: Hızlı Erişim Kartı */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-500"></div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Hedefine Odaklan 🎯</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Düzenli antrenman yapmak başarının anahtarıdır. Bugün hangi bölgeyi çalıştıracaksın?
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3">
                        <Link to="/dashboard/exercises" className="block w-full bg-white/10 hover:bg-white/20 py-3.5 px-4 rounded-xl text-sm font-medium transition flex items-center justify-between group/item border border-white/5 backdrop-blur-sm">
                            Egzersiz Keşfet <ArrowRight size={16} className="group-hover/item:translate-x-1 transition-transform"/>
                        </Link>

                        <Link to="/dashboard/progress" className="block w-full bg-white/10 hover:bg-white/20 py-3.5 px-4 rounded-xl text-sm font-medium transition flex items-center justify-between group/item border border-white/5 backdrop-blur-sm">
                            Gelişimi Gör <Scale size={16} className="group-hover/item:translate-x-1 transition-transform"/>
                        </Link>

                        <Link to="/dashboard/workouts" className="block w-full bg-blue-600 hover:bg-blue-500 py-3.5 px-4 rounded-xl text-sm font-medium transition flex items-center justify-between group/item shadow-lg shadow-blue-900/30">
                            Geçmişi İncele <ArrowRight size={16} className="group-hover/item:translate-x-1 transition-transform"/>
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- 3. SON AKTİVİTELER --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <Clock size={20} className="text-orange-500"/> Son Antrenmanlar
                    </h3>
                    {stats.recentWorkouts.length > 0 && (
                        <Link to="/dashboard/workouts" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline">
                            Tümünü Gör <ChevronRight size={16} />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.recentWorkouts.length > 0 ? (
                        stats.recentWorkouts.map((w) => (
                            <div key={w.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="bg-white p-2 rounded-lg text-slate-500 shadow-sm group-hover:text-blue-600 transition-colors">
                                        <Dumbbell size={18} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
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
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <p className="text-slate-400 text-sm mb-4">Henüz bir antrenman kaydı bulunmuyor.</p>
                            <Link to="/dashboard/workouts/new" className="text-blue-600 text-sm font-bold hover:underline">
                                İlk Antrenmanını Ekle 👉
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default Dashboard;