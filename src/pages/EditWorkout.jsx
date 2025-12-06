import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { getWorkoutById, updateWorkout } from "../services/workoutService";
import ExerciseSelector from "../components/ExerciseSelector";
import { Plus, Trash2, Save, Calendar, Clock, Loader2 } from "lucide-react";

function EditWorkout() {
    const { id } = useParams(); // URL'den ID'yi al
    const navigate = useNavigate();

    const [exercises, setExercises] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form Verileri
    const [date, setDate] = useState("");
    const [duration, setDuration] = useState("");
    const [items, setItems] = useState([]);

    // 1. Verileri Yükle (Hem Egzersiz Listesi Hem Mevcut Antrenman)
    useEffect(() => {
        const loadData = async () => {
            try {
                // Paralel istek atalım (daha hızlı olur)
                const [exRes, workoutRes] = await Promise.all([
                    api.get("/exercises?page=0&size=2000"), // Liste için
                    getWorkoutById(id) // Düzenlenecek antrenman
                ]);

                // Egzersiz listesini ayarla
                const exList = exRes.data.content || exRes.data;
                setExercises(exList);

                // Mevcut antrenman verilerini forma doldur
                const workout = workoutRes.data;
                setDate(workout.date.split("T")[0]); // 2025-12-06T00:00 -> 2025-12-06
                setDuration(workout.duration);

                // Detayları forma uygun formata çevir
                const formattedItems = workout.details.map(d => ({
                    exerciseId: d.exercise.id,
                    exerciseName: d.exercise.name, // ExerciseSelector için isim lazım
                    sets: d.sets,
                    reps: d.reps,
                    weight: d.weight
                }));
                setItems(formattedItems);

            } catch (err) {
                console.error("Veri yüklenemedi:", err);
                alert("Antrenman bilgileri alınamadı.");
                navigate("/dashboard/workouts");
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, [id, navigate]);

    // --- FORM İŞLEVLERİ (Create sayfasıyla aynı) ---
    const addRow = () => {
        setItems([...items, { exerciseId: "", exerciseName: "", sets: "", reps: "", weight: "" }]);
    };

    const removeRow = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateRow = (index, field, value) => {
        const copy = [...items];
        copy[index] = { ...copy[index], [field]: value };
        setItems(copy);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const validItems = items.filter(it => it.exerciseId);
        if (validItems.length === 0) {
            alert("En az bir egzersiz girmelisiniz.");
            setSubmitting(false);
            return;
        }

        const payload = {
            date: date,
            duration: Number(duration),
            items: validItems.map(it => ({
                exerciseId: Number(it.exerciseId),
                sets: Number(it.sets),
                reps: Number(it.reps),
                weight: Number(it.weight)
            }))
        };

        try {
            await updateWorkout(id, payload); // PUT isteği
            alert("Güncelleme başarılı! ✅");
            navigate("/dashboard/workouts");
        } catch (err) {
            console.error(err);
            alert("Güncellerken hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="text-center p-20">Yükleniyor...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Antrenmanı Düzenle</h1>
                <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800">İptal</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* TARİH & SÜRE */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Tarih</label>
                        <div className="relative flex items-center">
                            <Calendar size={16} className="absolute left-3 text-slate-400"/>
                            <input type="date" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Süre (dk)</label>
                        <div className="relative flex items-center">
                            <Clock size={16} className="absolute left-3 text-slate-400"/>
                            <input type="number" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={duration} onChange={e => setDuration(e.target.value)} required />
                        </div>
                    </div>
                </div>

                {/* EGZERSİZLER */}
                <div className="space-y-4">
                    {items.map((row, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative">
                            <button type="button" onClick={() => removeRow(index)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-5">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Egzersiz</label>
                                    <ExerciseSelector
                                        exercises={exercises}
                                        selectedId={row.exerciseId}
                                        onSelect={(id) => {
                                            const ex = exercises.find(e => e.id === id);
                                            updateRow(index, "exerciseId", id);
                                            updateRow(index, "exerciseName", ex?.name);
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Set</label>
                                    <input type="number" className="w-full p-2 border rounded-lg text-center" value={row.sets} onChange={e => updateRow(index, "sets", e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Tekrar</label>
                                    <input type="number" className="w-full p-2 border rounded-lg text-center" value={row.reps} onChange={e => updateRow(index, "reps", e.target.value)} />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Ağırlık</label>
                                    <input type="number" className="w-full p-2 border rounded-lg text-center" value={row.weight} onChange={e => updateRow(index, "weight", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addRow} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 flex justify-center items-center gap-2"><Plus size={18}/> Yeni Egzersiz Ekle</button>
                </div>

                {/* BUTON */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 md:pl-80 z-20 flex justify-end shadow-lg">
                    <button type="submit" disabled={submitting} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2">
                        {submitting ? <Loader2 className="animate-spin"/> : <Save size={20}/>} {submitting ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditWorkout;