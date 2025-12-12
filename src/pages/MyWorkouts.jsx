import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getMyWorkouts, deleteWorkout } from "../services/workoutService";
import {
    Calendar, Clock, Dumbbell, ChevronRight, Plus, Loader2, Trash2, Pencil,
    Search, Filter, TrendingUp, Activity
} from "lucide-react";

function MyWorkouts() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Modal State
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Verileri Çek
    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const res = await getMyWorkouts();
                // Tarihe göre yeniden eskiye sırala
                const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setWorkouts(sortedData);
            } catch (err) {
                console.error("Antrenmanlar çekilemedi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkouts();
    }, []);

    // Tarih Formatlayıcı
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    // ESC ile modal kapatma
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    // Silme İşlemi
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Bu antrenmanı kalıcı olarak silmek istediğine emin misin?")) {
            try {
                await deleteWorkout(id);
                setWorkouts(prev => prev.filter(w => w.id !== id));
            } catch (err) {
                console.error("Silme hatası:", err);
                alert("Silinirken bir hata oluştu.");
            }
        }
    };

    // --- FİLTRELEME MANTIĞI ---
    const filteredWorkouts = useMemo(() => {
        return workouts.filter(w => {
            // Arama: Antrenmandaki herhangi bir hareketin ismi aranan kelimeyi içeriyor mu?
            const matchesSearch = searchTerm === "" || w.details.some(d =>
                d.exercise?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            // Tarih Filtresi
            const matchesDate = filterDate === "" || w.date === filterDate;

            return matchesSearch && matchesDate;
        });
    }, [workouts, searchTerm, filterDate]);

    // --- İSTATİSTİKLER ---
    const stats = useMemo(() => {
        const totalDuration = filteredWorkouts.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const totalVolume = filteredWorkouts.reduce((acc, curr) =>
            acc + curr.details.reduce((sum, d) => sum + (d.weight * d.sets * d.reps), 0), 0
        );
        return {
            count: filteredWorkouts.length,
            duration: totalDuration,
            volume: (totalVolume / 1000).toFixed(1) // Ton cinsinden
        };
    }, [filteredWorkouts]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24 animate-fadeIn">

            {/* --- ÜST KISIM (BAŞLIK & İSTATİSTİKLER) --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Antrenman Geçmişi</h1>
                    <p className="text-slate-500">Geçmiş performanslarını incele ve analiz et.</p>
                </div>
                <Link to="/dashboard/workouts/new" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg hover:shadow-xl active:scale-95">
                    <Plus size={20} /> Yeni Antrenman
                </Link>
            </div>

            {/* --- İSTATİSTİK KARTLARI (ÖZET) --- */}
            {workouts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Activity size={24}/></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Toplam Antrenman</p>
                            <p className="text-2xl font-black text-slate-800">{stats.count}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Clock size={24}/></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Toplam Süre</p>
                            <p className="text-2xl font-black text-slate-800">{stats.duration} <span className="text-sm font-medium text-slate-400">dk</span></p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><TrendingUp size={24}/></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Toplam Hacim</p>
                            <p className="text-2xl font-black text-slate-800">{stats.volume} <span className="text-sm font-medium text-slate-400">Ton</span></p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FİLTRELEME BAR --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Hareket ara... (Örn: Bench Press)"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Calendar size={18}/></div>
                    <input
                        type="date"
                        className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-600"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                {(searchTerm || filterDate) && (
                    <button
                        onClick={() => {setSearchTerm(""); setFilterDate("");}}
                        className="text-red-500 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition"
                    >
                        Temizle
                    </button>
                )}
            </div>

            {/* --- LİSTE --- */}
            {filteredWorkouts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Sonuç Bulunamadı</h3>
                    <p className="text-slate-500 mb-6 mt-2">Arama kriterlerinize uygun antrenman yok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkouts.map((workout) => (
                        <div
                            key={workout.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col"
                            onClick={() => { setSelectedWorkout(workout); setShowModal(true); }}
                        >
                            {/* Üst Renkli Çizgi */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                            {/* Kart Başlığı */}
                            <div className="p-5 pb-0 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Calendar size={10}/> {new Date(workout.date).getFullYear()}
                                    </p>
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                        {formatDate(workout.date).split(' ').slice(0, 2).join(' ')}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {formatDate(workout.date).split(' ').slice(3).join(' ')}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Link
                                        to={`/dashboard/workouts/edit/${workout.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        <Pencil size={18} />
                                    </Link>
                                    <button
                                        onClick={(e) => handleDelete(e, workout.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* İçerik Özeti */}
                            <div className="p-5 flex-1">
                                <div className="space-y-3 mt-2">
                                    {workout.details.slice(0, 3).map((d, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                                            <span className="text-slate-600 truncate max-w-[150px]">{d.exercise?.name}</span>
                                            <span className="font-bold text-slate-800 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                                                {d.weight}kg
                                            </span>
                                        </div>
                                    ))}
                                    {workout.details.length > 3 && (
                                        <p className="text-xs text-center text-slate-400 font-medium pt-1">
                                            + {workout.details.length - 3} egzersiz daha
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Kart Altı */}
                            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
                                <span className="flex items-center gap-1"><Clock size={14} className="text-orange-500"/> {workout.duration} dk</span>
                                <span className="flex items-center gap-1 group-hover:text-blue-600 transition-colors">Detaylar <ChevronRight size={14}/></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- DETAY MODALI --- */}
            {showModal && selectedWorkout && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
                    <div
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">{formatDate(selectedWorkout.date)}</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Antrenman Detayları</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-white border p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-white flex-1">
                            <div className="grid grid-cols-1 gap-4">
                                {selectedWorkout.details.map((detail) => (
                                    <div key={detail.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 text-slate-500 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {detail.sets}x
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{detail.exercise?.name}</h4>
                                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{detail.exercise?.bodyPart}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-800">{detail.weight} <span className="text-xs font-normal text-slate-400">KG</span></p>
                                            <p className="text-xs font-medium text-slate-500">{detail.reps} Tekrar</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div className="flex gap-4 text-sm font-bold text-slate-600">
                                <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500"/> {selectedWorkout.duration} Dakika</span>
                                <span className="flex items-center gap-2"><Dumbbell size={16} className="text-blue-500"/> {selectedWorkout.details.length} Egzersiz</span>
                            </div>
                            <Link
                                to={`/dashboard/workouts/edit/${selectedWorkout.id}`}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-md"
                            >
                                Düzenle
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyWorkouts;