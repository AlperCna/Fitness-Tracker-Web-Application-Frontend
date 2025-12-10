import { useEffect, useState } from "react";
import api from "../services/api";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

function ExerciseLibrary() {
    const [exercises, setExercises] = useState([]);
    const [categories, setCategories] = useState([]);

    const [page, setPage] = useState(0);
    const itemsPerPage = 24;

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [exRes, catRes] = await Promise.all([
                    api.get("/exercises"),
                    api.get("/categories")
                ]);

                const allExercises = exRes.data.content || exRes.data;
                setExercises(allExercises);
                setCategories(catRes.data);
            } catch (err) {
                console.error("Veri hatası:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
        const categoryName = ex.categoryName || ex.category?.name;
        const matchesCategory = selectedCategory === "" || categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
    const displayedExercises = filteredExercises.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
    );

    useEffect(() => {
        setPage(0);
    }, [search, selectedCategory]);

    const goToNextPage = () => {
        setPage(p => Math.min(totalPages - 1, p + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToPrevPage = () => {
        setPage(p => Math.max(0, p - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 pb-10 animate-fadeIn">

            {/* --- ÜST ALAN --- */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    Egzersiz Kütüphanesi
                </h1>
                <p className="text-slate-500 mt-1">
                    Toplam{" "}
                    <span className="font-bold text-blue-600">
                        {filteredExercises.length}
                    </span>{" "}
                    egzersiz bulundu.
                </p>

                <div className="flex flex-col md:flex-row gap-4 mt-6">

                    {/* Arama Kutusu */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Egzersiz ara..."
                            className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Kategori Filtresi */}
                    <select
                        className="px-4 py-3 border border-slate-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] transition-all"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                </div>
            </div>

            {/* --- KART LİSTESİ --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-slate-500 mt-4 text-sm">Veriler yükleniyor...</p>
                </div>
            ) : (
                <>
                    {displayedExercises.length === 0 ? (
                        <div className="text-center p-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                            🔍 Arama kriterlerine uygun egzersiz bulunamadı.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                            {displayedExercises.map((ex) => (
                                <div
                                    key={ex.id}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
                                    onClick={() => { setSelectedExercise(ex); setShowModal(true); }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                                            {ex.name}
                                        </h2>

                                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 tracking-wide">
                                            {ex.bodyPart || "Genel"}
                                        </span>
                                    </div>

                                    <p className="text-sm text-blue-600 font-medium mb-2">
                                        {ex.categoryName || ex.category?.name}
                                    </p>

                                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed flex-1 mb-4">
                                        {ex.description || "Açıklama mevcut değil."}
                                    </p>

                                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                                        <span>Ekipman: <span className="text-slate-800 font-semibold">{ex.equipment || "Yok"}</span></span>
                                        <span className="text-blue-600 font-medium group-hover:underline">Detay</span>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                    {/* --- PAGINATION --- */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-5 mt-10">

                            <button
                                onClick={goToPrevPage}
                                disabled={page === 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition"
                            >
                                <ChevronLeft size={18} />
                                Önceki
                            </button>

                            <span className="text-sm font-medium bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                                Sayfa {page + 1} / {totalPages}
                            </span>

                            <button
                                onClick={goToNextPage}
                                disabled={page === totalPages - 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition"
                            >
                                Sonraki
                                <ChevronRight size={18} />
                            </button>

                        </div>
                    )}
                </>
            )}

            {/* --- MODAL (DETAY) --- */}
            {showModal && selectedExercise && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-10 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 w-9 h-9 rounded-full flex items-center justify-center transition"
                            onClick={() => setShowModal(false)}
                        >
                            ✖
                        </button>

                        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">
                            {selectedExercise.name}
                        </h2>

                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-200">
                                {selectedExercise.categoryName || selectedExercise.category?.name}
                            </span>

                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
                                {selectedExercise.bodyPart}
                            </span>
                        </div>

                        <div className="space-y-6">

                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                                <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase">
                                    📋 Talimatlar
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {selectedExercise.description || "Bu egzersiz için henüz detaylı bir açıklama eklenmemiş."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white p-4 border border-slate-100 rounded-xl shadow-sm">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                Gerekli Ekipman:{" "}
                                <strong className="text-slate-900 ml-1">{selectedExercise.equipment || "Yok"}</strong>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExerciseLibrary;
