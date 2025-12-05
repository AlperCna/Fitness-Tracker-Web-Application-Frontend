import { useEffect, useState } from "react";
import api from "../services/api";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

function ExerciseLibrary() {
    // --- STATE YÖNETİMİ ---
    const [exercises, setExercises] = useState([]); // Tüm egzersizler (1300+)
    const [categories, setCategories] = useState([]);

    // Sayfalama State'leri
    const [page, setPage] = useState(0);
    const itemsPerPage = 24; // Sayfada kaç tane görünsün?

    // Filtre State'leri
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Modal State'leri
    const [showModal, setShowModal] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);

    // Yükleniyor durumu
    const [loading, setLoading] = useState(true);

    // ESC ile modal kapatma
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    // 1. Verileri Çek (Sayfa Yüklenince)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Egzersizleri ve Kategorileri paralel çekelim
                const [exRes, catRes] = await Promise.all([
                    api.get("/exercises"),
                    api.get("/categories")
                ]);

                // Backend Page yapısında mı List yapısında mı dönüyor kontrolü
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

    // 2. Filtreleme Mantığı
    // Arama kutusu veya kategori değiştiğinde çalışır
    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
        const categoryName = ex.categoryName || ex.category?.name;
        const matchesCategory = selectedCategory === "" || categoryName === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // 3. Sayfalama Mantığı (Client-Side Slicing)
    // Filtrelenmiş listeyi parçalara bölüyoruz
    const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
    const displayedExercises = filteredExercises.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
    );

    // Filtre değişirse sayfayı başa al
    useEffect(() => {
        setPage(0);
    }, [search, selectedCategory]);

    // Sayfa değiştirme fonksiyonları
    const goToNextPage = () => {
        setPage(p => Math.min(totalPages - 1, p + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToPrevPage = () => {
        setPage(p => Math.max(0, p - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 pb-10">
            {/* --- ÜST KISIM --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Egzersiz Kütüphanesi
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Toplam {filteredExercises.length} egzersiz bulundu.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Egzersiz ara..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="px-4 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- LİSTELEME ALANI --- */}
            {loading ? (
                <div className="text-center p-20">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-500 mt-4">Veriler yükleniyor...</p>
                </div>
            ) : (
                <>
                    {displayedExercises.length === 0 ? (
                        <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            🔍 Arama kriterlerine uygun egzersiz bulunamadı.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayedExercises.map((ex) => (
                                <div
                                    key={ex.id}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all flex flex-col cursor-pointer group h-full"
                                    onClick={() => {
                                        setSelectedExercise(ex);
                                        setShowModal(true);
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition line-clamp-1" title={ex.name}>
                                            {ex.name}
                                        </h2>
                                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 tracking-wider">
                                            {ex.bodyPart || "Genel"}
                                        </span>
                                    </div>

                                    <p className="text-sm text-blue-600 font-medium mb-2">
                                        {ex.categoryName || ex.category?.name}
                                    </p>

                                    <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
                                        {ex.description || "Açıklama mevcut değil."}
                                    </p>

                                    <div className="pt-3 border-t border-slate-50 text-xs text-slate-400 flex justify-between items-center mt-auto">
                                        <span>Ekipman: <span className="text-slate-600 font-medium">{ex.equipment || "Yok"}</span></span>
                                        <span className="text-blue-600 font-medium group-hover:underline">Detay</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- SAYFALAMA BUTONLARI (PAGINATION) --- */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                            <button
                                onClick={goToPrevPage}
                                disabled={page === 0}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors text-slate-700 font-medium"
                            >
                                <ChevronLeft size={18} /> Önceki
                            </button>

                            <span className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-md">
                                Sayfa {page + 1} / {totalPages}
                            </span>

                            <button
                                onClick={goToNextPage}
                                disabled={page === totalPages - 1}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors text-slate-700 font-medium"
                            >
                                Sonraki <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* --- DETAY MODALI --- */}
            {showModal && selectedExercise && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative animate-fadeIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center"
                            onClick={() => setShowModal(false)}
                        >
                            ✖
                        </button>

                        <h2 className="text-3xl font-bold mb-3 text-slate-800 pr-8">{selectedExercise.name}</h2>

                        <div className="flex flex-wrap gap-2 mb-6">
                             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-200">
                                {selectedExercise.categoryName || selectedExercise.category?.name}
                             </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
                                {selectedExercise.bodyPart}
                             </span>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase flex items-center gap-2">
                                    📋 Talimatlar
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {selectedExercise.description || "Bu egzersiz için henüz detaylı bir açıklama eklenmemiş."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white p-3 border border-slate-100 rounded-lg inline-block shadow-sm">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                Gerekli Ekipman: <strong className="text-slate-800">{selectedExercise.equipment || "Yok"}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExerciseLibrary;