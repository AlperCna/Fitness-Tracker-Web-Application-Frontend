import { useState, useEffect } from "react";
import api from "../services/api";
import ExerciseSelector from "../components/ExerciseSelector";
import { Plus, Trash2, Save, Calendar, Clock, Loader2 } from "lucide-react";

function WorkoutPage() {
    const [exercises, setExercises] = useState([]);
    const [loadingExercises, setLoadingExercises] = useState(true);

    // Üst form
    const [date, setDate] = useState(() => {
        return new Date().toISOString().slice(0, 10);
    });
    const [duration, setDuration] = useState("");

    // Dinamik satırlar
    const [items, setItems] = useState([
        { exerciseId: "", exerciseName: "", sets: "", reps: "", weight: "" }
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Egzersiz listesini çek
    useEffect(() => {
        const load = async () => {
            try {
                setLoadingExercises(true);

                // ✔ Tüm egzersizleri getir
                const res = await api.get("/exercises");
                const data = res.data.content || res.data;

                setExercises(data);
            } catch (err) {
                console.error("Egzersiz yüklenirken hata:", err);
            } finally {
                setLoadingExercises(false);
            }
        };
        load();
    }, []);

    // Satır ekle
    const addRow = () => {
        setItems(prev => [
            ...prev,
            { exerciseId: "", exerciseName: "", sets: "", reps: "", weight: "" }
        ]);
    };

    // Satır sil
    const removeRow = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Satır alanı güncelle
    const updateRow = (index, field, value) => {
        setItems(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    // Gönder
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        const validItems = items.filter(it => it.exerciseId);

        if (validItems.length === 0) {
            setErrorMsg("En az bir egzersiz seçmelisiniz.");
            setSubmitting(false);
            return;
        }

        // ✔ Token'ı elle Axios header'ına ekle (403'ü çözer)
        const token = localStorage.getItem("token");
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        const payload = {
            date: date,
            duration: duration ? Number(duration) : null,
            items: validItems.map(it => ({
                exerciseId: Number(it.exerciseId),
                sets: it.sets ? Number(it.sets) : null,
                reps: it.reps ? Number(it.reps) : null,
                weight: it.weight ? Number(it.weight) : null
            }))
        };

        try {
            await api.post("/workouts", payload);

            setSuccessMsg("Antrenman başarıyla kaydedildi! Yönlendiriliyorsunuz...");

            // Formu temizle
            setItems([{ exerciseId: "", exerciseName: "", sets: "", reps: "", weight: "" }]);
            setDuration("");

            // 2 saniye sonra dashboard'a dön
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);

        } catch (err) {
            console.error("Workout kayıt hatası:", err);
            setErrorMsg("Antrenman kaydedilirken bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Yeni Antrenman Oluştur</h1>

                <button
                    onClick={() => window.history.back()}
                    className="text-sm text-slate-500 hover:text-slate-800"
                >
                    İptal
                </button>
            </div>

            {/* Mesajlar */}
            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                    ⚠️ {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                    ✅ {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* TARİH + SÜRE KARTI */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">

                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                            <Calendar size={14}/> Tarih
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                            <Clock size={14}/> Süre (dk)
                        </label>
                        <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Örn: 45"
                        />
                    </div>
                </div>

                {/* EGZERSİZ LİSTESİ */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <h2 className="text-lg font-bold text-slate-800">Egzersizler & Setler</h2>
                    </div>

                    {items.map((row, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">

                            {/* Silme Butonu */}
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-1.5 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                                {/* EXERCISE SELECTOR */}
                                <div className="md:col-span-5">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                                        Egzersiz Seç
                                    </label>
                                    <ExerciseSelector
                                        exercises={exercises}
                                        selectedId={row.exerciseId}
                                        onSelect={(id) => {
                                            const ex = exercises.find(e => e.id === id);
                                            updateRow(index, "exerciseId", id);
                                            updateRow(index, "exerciseName", ex?.name || "");
                                        }}
                                    />
                                </div>

                                {/* SET */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Set</label>
                                    <input
                                        type="number" min="1"
                                        className="w-full px-3 py-2 border rounded-lg bg-white text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={row.sets}
                                        onChange={(e) => updateRow(index, "sets", e.target.value)}
                                        placeholder="3"
                                    />
                                </div>

                                {/* TEKRAR */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tekrar</label>
                                    <input
                                        type="number" min="1"
                                        className="w-full px-3 py-2 border rounded-lg bg-white text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={row.reps}
                                        onChange={(e) => updateRow(index, "reps", e.target.value)}
                                        placeholder="12"
                                    />
                                </div>

                                {/* AĞIRLIK */}
                                <div className="md:col-span-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ağırlık (kg)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            className="w-full px-3 py-2 border rounded-lg bg-white text-center font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none pr-6"
                                            value={row.weight}
                                            onChange={(e) => updateRow(index, "weight", e.target.value)}
                                            placeholder="50"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">KG</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}

                    {/* Satır Ekle Butonu */}
                    <button
                        type="button"
                        onClick={addRow}
                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus size={18} /> Başka Egzersiz Ekle
                    </button>
                </div>

                {/* GÖNDER BUTONU */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 md:pl-80 z-20 flex justify-end shadow-lg">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 font-bold transition-all active:scale-95"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {submitting ? "Kaydediliyor..." : "Antrenmanı Kaydet"}
                    </button>
                </div>

            </form>
        </div>
    );
}

export default WorkoutPage;
