import { useState, useEffect, useRef } from "react";
import { Search, Check, ChevronDown } from "lucide-react";

const ExerciseSelector = ({ exercises, selectedId, onSelect }) => {
    // Dropdown açık mı? Arama metni nedir?
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Dışarı tıklamayı algılamak için referans
    const wrapperRef = useRef(null);

    // Seçili olan egzersizi bul (İsmini göstermek için)
    const selectedExercise = exercises.find(ex => ex.id === parseInt(selectedId));

    // Sayfanın herhangi bir yerine tıklandığında dropdown'ı kapat
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // 🔍 FİLTRELEME MANTIĞI
    // 1300 veriyi tarayıp, arama terimine uyan İLK 50 tanesini getiriyoruz.
    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50);

    return (
        <div className="relative" ref={wrapperRef}>

            {/* 1. GÖRÜNEN KUTU (Tıklayınca açılır) */}
            <div
                className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer bg-white transition-all text-sm ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`truncate ${selectedExercise ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                    {selectedExercise ? selectedExercise.name : "Egzersiz Seçiniz..."}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
            </div>

            {/* 2. AÇILIR LİSTE (DROPDOWN) */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fadeIn">

                    {/* Arama Inputu (Listenin tepesine yapışık) */}
                    <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Yazmaya başla..."
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Liste Elemanları */}
                    {filteredExercises.length > 0 ? (
                        filteredExercises.map(ex => (
                            <div
                                key={ex.id}
                                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-slate-50 last:border-0 flex justify-between items-center group transition-colors ${selectedId === ex.id ? 'bg-blue-50/50' : ''}`}
                                onClick={() => {
                                    onSelect(ex.id); // Seçilen ID'yi üst bileşene gönder
                                    setIsOpen(false);
                                    setSearchTerm(""); // Aramayı sıfırla
                                }}
                            >
                                <div className="flex flex-col">
                                    <span className={`font-medium ${selectedId === ex.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {ex.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                        {ex.bodyPart}
                                    </span>
                                </div>
                                {selectedId === ex.id && <Check size={16} className="text-blue-600" />}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-xs text-slate-400">
                            Sonuç bulunamadı.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 👇 BU SATIR EKSİK OLDUĞU İÇİN HATA ALIYORSUN
export default ExerciseSelector;