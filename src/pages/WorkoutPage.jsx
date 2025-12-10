import { useState } from "react";
import api from "../services/api";
import ExerciseSelectionModal from "../components/ExerciseSelectionModal"; // 🔥 Modal Bileşeni
import { Plus, Trash2, Save, Calendar, Clock, Loader2, Dumbbell } from "lucide-react";

function WorkoutPage() {
    // Modal Görünürlük Durumu
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Üst form verileri
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [duration, setDuration] = useState("");

    // Seçilen egzersizlerin listesi
    const [items, setItems] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // 🔥 Modal'dan gelen egzersizleri listeye ekleyen fonksiyon (DÜZELTİLMİŞ)
    const handleAddExercises = (selectedExercises) => {
        const newItems = selectedExercises.map(ex => {

            // 🛡️ GÜVENLİK KONTROLÜ: Category verisini temizle (Beyaz ekran hatasını çözen kısım)
            let safeCategory = "Genel";

            if (ex.category) {
                if (typeof ex.category === 'object') {
                    // Eğer backend {id: 1, name: "Strength"} yolladıysa, sadece ismini al
                    safeCategory = ex.category.name || "Genel";
                } else {
                    // Eğer direkt "Strength" yazısı yolladıysa kendisini al
                    safeCategory = ex.category;
                }
            } else if (ex.categoryName) {
                // Alternatif isimlendirme kontrolü
                safeCategory = ex.categoryName;
            }

            return {
                exerciseId: ex.id,
                exerciseName: ex.name,
                bodyPart: ex.bodyPart,
                category: safeCategory, // ✅ Artık burası kesinlikle bir String (Yazı)
                sets: "",
                reps: "",
                weight: ""
            };
        });

        // Mevcut listenin altına ekle
        setItems(prev => [...prev, ...newItems]);
    };

    // Satır silme
    const removeRow = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Satır güncelleme (Set, Reps, Weight)
    const updateRow = (index, field, value) => {
        setItems(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    // Kaydetme İşlemi
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (items.length === 0) {
            setErrorMsg("Lütfen en az bir egzersiz ekleyin.");
            setSubmitting(false);
            return;
        }

        // Token kontrolü
        const token = localStorage.getItem("token");
        if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const payload = {
            date: date,
            duration: duration ? Number(duration) : null,
            items: items.map(it => ({
                exerciseId: Number(it.exerciseId),
                sets: it.sets ? Number(it.sets) : null,
                reps: it.reps ? Number(it.reps) : null,
                weight: it.weight ? Number(it.weight) : null
            }))
        };

        try {
            await api.post("/workouts", payload);
            setSuccessMsg("Antrenman başarıyla kaydedildi! Yönlendiriliyorsunuz...");
            setTimeout(() => window.location.href = "/dashboard", 1500);
        } catch (err) {
            console.error("Hata:", err);
            setErrorMsg("Kaydedilirken hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-fadeIn">

            {/* --- BAŞLIK ALANI --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Antrenman Kaydet</h1>
                    <p className="text-slate-500">Bugünkü performansını kayda geçir.</p>
                </div>
                <button
                    onClick={() => window.history.back()}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                    İptal
                </button>
            </div>

            {/* --- MESAJLAR --- */}
            {errorMsg && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">⚠️ {errorMsg}</div>}
            {successMsg && <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">✅ {successMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- 1. TARİH VE SÜRE KARTI --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                            <Calendar size={14} className="text-blue-500"/> Tarih
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-slate-700"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                            <Clock size={14} className="text-orange-500"/> Süre (Dakika)
                        </label>
                        <input
                            type="number" min="1"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-slate-700"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Örn: 60"
                        />
                    </div>
                </div>

                {/* --- 2. EGZERSİZ LİSTESİ --- */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Dumbbell className="text-slate-400" size={24}/>
                            Egzersizler
                        </h2>

                        {/* MODAL AÇMA BUTONU */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition active:scale-95"
                        >
                            <Plus size={20} /> Egzersiz Ekle
                        </button>
                    </div>

                    {items.length === 0 ? (
                        // BOŞ DURUM (EMPTY STATE)
                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-500 cursor-pointer transition group"
                        >
                            <Dumbbell size={48} className="mb-4 opacity-50 group-hover:scale-110 transition"/>
                            <p className="font-medium text-lg">Henüz egzersiz eklenmedi.</p>
                            <p className="text-sm opacity-70">Listeden seçim yapmak için tıkla.</p>
                        </div>
                    ) : (
                        // DOLU LİSTE
                        <div className="space-y-4">
                            {items.map((row, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group hover:shadow-md transition">

                                    {/* Egzersiz Başlığı ve Bilgisi */}
                                    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-800 mb-1">{row.exerciseName}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide border border-slate-200">
                                                    {row.bodyPart || "Genel"}
                                                </span>
                                                {row.category && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wide border border-blue-100">
                                                        {row.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                                            title="Listeden Çıkar"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    {/* Input Alanları */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Set Sayısı</label>
                                            <input
                                                type="number" placeholder="3"
                                                className="w-full px-3 py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition"
                                                value={row.sets}
                                                onChange={(e) => updateRow(index, "sets", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tekrar</label>
                                            <input
                                                type="number" placeholder="12"
                                                className="w-full px-3 py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition"
                                                value={row.reps}
                                                onChange={(e) => updateRow(index, "reps", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ağırlık (kg)</label>
                                            <div className="relative">
                                                <input
                                                    type="number" placeholder="0"
                                                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition"
                                                    value={row.weight}
                                                    onChange={(e) => updateRow(index, "weight", e.target.value)}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">KG</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Liste Altı Hızlı Ekleme Butonu */}
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition font-medium flex items-center justify-center gap-2 group"
                            >
                                <Plus size={18} className="group-hover:scale-110 transition"/> Daha Fazla Ekle
                            </button>
                        </div>
                    )}
                </div>

                {/* --- STICKY FOOTER (KAYDET BUTONU) --- */}
                <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 md:pl-80 z-40 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        type="submit"
                        disabled={submitting || items.length === 0}
                        className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {submitting ? "Kaydediliyor..." : "Antrenmanı Bitir ve Kaydet"}
                    </button>
                </div>

            </form>

            {/* 🔥 MODAL BİLEŞENİ */}
            <ExerciseSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAddExercises}
            />

        </div>
    );
}

export default WorkoutPage;