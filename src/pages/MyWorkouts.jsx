import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyWorkouts, deleteWorkout } from "../services/workoutService";
import { Calendar, Clock, Dumbbell, ChevronRight, Plus, Loader2, Trash2, Pencil } from "lucide-react"; // Pencil eklendi

function MyWorkouts() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

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
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
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

    // --- SİLME İŞLEMİ ---
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Karta tıklanmış gibi olup modal açılmasın diye

        if (window.confirm("Bu antrenmanı kalıcı olarak silmek istediğine emin misin?")) {
            try {
                await deleteWorkout(id);
                // Listeden silineni çıkar (Sayfayı yenilemeden güncelle)
                setWorkouts(prev => prev.filter(w => w.id !== id));
            } catch (err) {
                console.error("Silme hatası:", err);
                alert("Silinirken bir hata oluştu.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">

            {/* BAŞLIK VE YENİ EKLE BUTONU */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Antrenman Geçmişi</h1>
                <Link to="/dashboard/workouts/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-200">
                    <Plus size={18} /> Yeni Ekle
                </Link>
            </div>

            {/* LİSTE VEYA BOŞ DURUM */}
            {workouts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                        <Dumbbell size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Henüz antrenman yok</h3>
                    <p className="text-slate-500 mb-6 mt-2">İlk antrenmanını kaydederek yolculuğuna başla!</p>
                    <Link to="/dashboard/workouts/new" className="text-blue-600 font-semibold hover:underline">
                        Şimdi Oluştur →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {workouts.map((workout) => (
                        <div
                            key={workout.id}
                            className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                            onClick={() => {
                                setSelectedWorkout(workout);
                                setShowModal(true);
                            }}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

                            <div className="flex justify-between items-start mb-4 pl-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TARİH</p>
                                        <p className="text-slate-800 font-bold text-sm">{formatDate(workout.date)}</p>
                                    </div>
                                </div>

                                {/* 🔥 DÜZENLE, SİL VE OK BUTONLARI */}
                                <div className="flex items-center gap-1">
                                    <Link
                                        to={`/dashboard/workouts/edit/${workout.id}`}
                                        onClick={(e) => e.stopPropagation()} // Modalı açmasın
                                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all z-10"
                                        title="Düzenle"
                                    >
                                        <Pencil size={18} />
                                    </Link>

                                    <button
                                        onClick={(e) => handleDelete(e, workout.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
                                        title="Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-4 pl-3">
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                    <Clock size={14} />
                                    <span>{workout.duration} dk</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                    <Dumbbell size={14} />
                                    <span>{workout.details ? workout.details.length : 0} Hareket</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* DETAY MODALI */}
            {showModal && selectedWorkout && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-0 relative animate-fadeIn max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Antrenman Detayı</h2>
                                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                    <Calendar size={14}/> {formatDate(selectedWorkout.date)}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-white border border-slate-200 p-2 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all text-slate-400"
                            >
                                ✖
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                {selectedWorkout.details && selectedWorkout.details.map((detail) => (
                                    <div key={detail.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800 text-sm">
                                                {detail.exercise?.name || "Bilinmeyen Egzersiz"}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50 px-2 py-1 rounded">
                                                {detail.exercise?.bodyPart || "GENEL"}
                                            </span>
                                        </div>

                                        <div className="flex justify-end items-center gap-4 text-sm pt-2 border-t border-slate-50 mt-2">
                                            <div className="font-semibold text-blue-600">
                                                {detail.sets} Set x {detail.reps} Tekrar
                                            </div>
                                            <div className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                                {detail.weight} kg
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 text-center bg-slate-50 text-slate-500 text-xs font-medium">
                            Toplam Süre: {selectedWorkout.duration} Dakika
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyWorkouts;