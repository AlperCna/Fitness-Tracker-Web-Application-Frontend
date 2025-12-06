import { useEffect, useState } from "react";
import { getMyWorkouts } from "../services/workoutService";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
    Activity, Clock, Dumbbell, Trophy, Calendar,
    TrendingUp, Loader2, ArrowUpRight
} from "lucide-react";

function Analytics() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDuration: 0,
        totalVolume: 0,
        totalWorkouts: 0,
        favoriteExercise: "Veri Yok",
        pieData: [],
        areaData: [],
        barData: []
    });

    // Renk Paleti (Modern & Canlı)
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    useEffect(() => {
        const fetchAndCalculate = async () => {
            try {
                const res = await getMyWorkouts();
                const data = res.data;

                // Tarihe göre sırala (Eskiden yeniye - Grafikler için)
                const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setWorkouts(sortedData);

                calculateStatistics(sortedData);
            } catch (err) {
                console.error("Analiz hatası:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAndCalculate();
    }, []);

    // --- HESAPLAMA MOTORU (Tüm matematik burada) ---
    const calculateStatistics = (data) => {
        let durationSum = 0;
        let volumeSum = 0;
        let bodyPartCounts = {};
        let exerciseCounts = {};

        // Grafikler için geçici diziler
        let dailyStats = {}; // { "12 Ara": 45dk }

        data.forEach(w => {
            // 1. Toplam Süre
            durationSum += w.duration || 0;

            // 2. Günlük Süre (Area Chart İçin)
            const dateKey = new Date(w.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            dailyStats[dateKey] = (dailyStats[dateKey] || 0) + w.duration;

            if (w.details) {
                w.details.forEach(d => {
                    // 3. Toplam Hacim (Set * Rep * Weight)
                    volumeSum += (d.sets * d.reps * d.weight);

                    // 4. Vücut Bölgesi Sayımı
                    const part = d.exercise?.bodyPart || "Diğer";
                    bodyPartCounts[part] = (bodyPartCounts[part] || 0) + 1;

                    // 5. Favori Hareket Sayımı
                    const exName = d.exercise?.name;
                    if (exName) exerciseCounts[exName] = (exerciseCounts[exName] || 0) + 1;
                });
            }
        });

        // Favori hareketi bul
        const favExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0];

        // Pie Chart Verisi Hazırla
        const pieChartData = Object.keys(bodyPartCounts).map(key => ({
            name: key.toUpperCase(),
            value: bodyPartCounts[key]
        }));

        // Area Chart Verisi Hazırla (Son 10 antrenman)
        const areaChartData = Object.keys(dailyStats).map(key => ({
            name: key,
            süre: dailyStats[key]
        })).slice(-10); // Sadece son 10 günü al ki grafik sıkışmasın

        // Bar Chart (Hacim) Verisi - Basitleştirilmiş son 5 antrenman
        const barChartData = data.slice(-5).map(w => {
            let vol = 0;
            w.details?.forEach(d => vol += d.sets * d.reps * d.weight);
            return {
                name: new Date(w.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                tonaj: (vol / 1000).toFixed(1) // Ton cinsinden
            };
        });

        setStats({
            totalDuration: durationSum,
            totalVolume: (volumeSum / 1000).toFixed(1), // Tonaj
            totalWorkouts: data.length,
            favoriteExercise: favExercise ? favExercise[0] : "Veri Yok",
            pieData: pieChartData,
            areaData: areaChartData,
            barData: barChartData
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 fade-in-up">

            {/* BAŞLIK */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Performans Analizi</h1>
                <p className="text-slate-500 mt-2">Antrenman verilerin ve gelişim grafiklerin.</p>
            </div>

            {/* --- 1. KPI KARTLARI (GRID) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Kart 1: Süre */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Süre</p>
                            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalDuration} <span className="text-sm font-medium text-slate-400">dk</span></h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-green-600 bg-green-50 w-max px-2 py-1 rounded-full">
                        <TrendingUp size={12} className="mr-1" /> İstikrarlı Gelişim
                    </div>
                </div>

                {/* Kart 2: Tonaj */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Tonaj</p>
                            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalVolume} <span className="text-sm font-medium text-slate-400">Ton</span></h3>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Dumbbell size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Kaldırılan toplam ağırlık hacmi.
                    </div>
                </div>

                {/* Kart 3: Antrenman Sayısı */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Antrenman</p>
                            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalWorkouts} <span className="text-sm font-medium text-slate-400">Adet</span></h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Kaydedilen toplam seans.
                    </div>
                </div>

                {/* Kart 4: Favori Hareket */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Favori Hareket</p>
                            <h3 className="text-lg font-bold text-slate-800 mt-2 truncate" title={stats.favoriteExercise}>
                                {stats.favoriteExercise}
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Trophy size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        En sık yapılan egzersiz.
                    </div>
                </div>
            </div>

            {/* --- 2. ANA GRAFİKLER --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* GRAFİK A: Süre Değişimi (Büyük - 2 Kolon) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500"/> Zaman İçinde Aktivite (Dk)
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.areaData}>
                                <defs>
                                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="süre"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTime)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GRAFİK B: Kas Grubu Dağılımı (Küçük - 1 Kolon) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Dumbbell size={18} className="text-emerald-500"/> Bölge Dağılımı
                    </h3>
                    <div className="h-72">
                        {stats.pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <p>Henüz veri yok.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- 3. ALT BÖLÜM: HACİM GRAFİĞİ VE SON AKTİVİTELER --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* GRAFİK C: Hacim (Bar Chart) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-orange-500"/> Son 5 Antrenman Hacmi (Ton)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px'}} />
                                <Bar dataKey="tonaj" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* LİSTE: Son Aktiviteler */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Calendar size={18} className="text-purple-500"/> Son Aktiviteler
                    </h3>
                    <div className="space-y-4">
                        {workouts.slice(-4).reverse().map((w) => (
                            <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm">
                                        <Dumbbell size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Antrenman</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(w.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} • {w.duration} dk
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200">
                                        {w.details?.length || 0} Hareket
                                    </span>
                                </div>
                            </div>
                        ))}
                        {workouts.length === 0 && <p className="text-slate-400 text-center">Kayıt yok.</p>}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Analytics;