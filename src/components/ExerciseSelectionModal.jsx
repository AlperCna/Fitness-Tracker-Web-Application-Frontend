import { useState, useEffect, useMemo, useCallback, memo } from "react";
import api from "../services/api";
import { X, Search, CheckCircle, Dumbbell, Filter, Loader2 } from "lucide-react";

//
// Bu bileşen, sadece kendi "isSelected" durumu değişirse yeniden render olur.
const ExerciseOption = memo(({ ex, isSelected, onToggle }) => {
    return (
        <div
            onClick={() => onToggle(ex.id)}
            className={`
                relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 group select-none
                ${isSelected
                ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500"
                : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
            }
            `}
        >
            <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300 group-hover:border-blue-400"}
            `}>
                {isSelected && <CheckCircle size={14} className="text-white" />}
            </div>

            <div>
                <h3 className={`font-bold text-sm mb-1 ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                    {ex.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {ex.bodyPart || "Genel"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">
                        {ex.categoryName || ex.category?.name || "Kategorisiz"}
                    </span>
                </div>
            </div>
        </div>
    );
});

const ExerciseSelectionModal = ({ isOpen, onClose, onConfirm }) => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);

    // Arama ve Filtreleme
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);

    // Seçilenlerin ID'lerini tutan liste
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (isOpen && exercises.length === 0) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [exRes, catRes] = await Promise.all([
                api.get("/exercises"),
                api.get("/categories")
            ]);
            setExercises(exRes.data.content || exRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Veri hatası:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 OPTİMİZE EDİLMİŞ SEÇİM FONKSİYONU
    const toggleSelection = useCallback((id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    }, []);

    // "Ekle" butonuna basınca
    const handleConfirm = () => {
        const selectedObjects = exercises.filter(ex => selectedIds.includes(ex.id));
        onConfirm(selectedObjects);
        onClose();
        setSelectedIds([]);
        setSearch(""); // Aramayı temizle
    };

    // 🔥 OPTİMİZE EDİLMİŞ FİLTRELEME (Sadece arama değişince çalışır)
    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
            const categoryName = ex.categoryName || ex.category?.name;
            const matchesCategory = selectedCategory === "" || categoryName === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [exercises, search, selectedCategory]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                {/* --- HEADER --- */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Egzersiz Seç</h2>
                        <p className="text-sm text-slate-500">Listeye eklemek istediğin hareketleri işaretle.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* --- FİLTRELER --- */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-white shadow-sm z-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Egzersiz ara... (Örn: Bench Press)"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            className="w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Tüm Kategoriler</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* --- LİSTE (SCROLLABLE) --- */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full flex-col gap-2">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <p className="text-slate-400 text-sm">Egzersizler yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredExercises.map(ex => (
                                <ExerciseOption
                                    key={ex.id}
                                    ex={ex}
                                    isSelected={selectedIds.includes(ex.id)}
                                    onToggle={toggleSelection}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && filteredExercises.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Search size={48} className="mb-4 opacity-20"/>
                            <p>Aradığınız kriterde egzersiz bulunamadı.</p>
                        </div>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <div className="text-sm font-medium text-slate-600">
                        <span className="font-bold text-blue-600 text-lg">{selectedIds.length}</span> egzersiz seçildi
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition">
                            İptal
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className="px-6 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95"
                        >
                            <Dumbbell size={18} />
                            Seçilenleri Ekle
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ExerciseSelectionModal;