import { useState, useEffect } from "react";
import { getProgressLogs, addProgressLog, deleteProgressLog } from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Plus, Scale, Calendar, TrendingUp } from "lucide-react";

function ProgressPage() {
    const [logs, setLogs] = useState([]);
    const [weight, setWeight] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Varsayılan: Bugün
    const [loading, setLoading] = useState(true);

    // Sayfa açılınca verileri çek
    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await getProgressLogs();
            // Grafikte düzgün görünmesi için tarihe göre (Eskiden > Yeniye) sırala
            const sortedData = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            setLogs(sortedData);
        } catch (err) {
            console.error("Veri çekilemedi:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!weight || !date) return;

        try {
            await addProgressLog({ weight: parseFloat(weight), date: date });
            setWeight(""); // Inputu temizle
            fetchLogs();   // Listeyi güncelle
        } catch (err) {
            alert("Ekleme başarısız oldu.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu kaydı silmek istediğine emin misin?")) return;
        try {
            await deleteProgressLog(id);
            // Listeden çıkar (API'ye tekrar gitmeden hızlı güncelleme)
            setLogs(logs.filter(log => log.id !== id));
        } catch (err) {
            alert("Silme işlemi başarısız.");
        }
    };

    // Mevcut kilonuzu (son kayıt) bulalım
    const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : "-";
    const startWeight = logs.length > 0 ? logs[0].weight : "-";

    return (
        <div className="space-y-8 pb-10 animate-fadeIn">

            {/* BAŞLIK */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <TrendingUp className="text-blue-600" /> Gelişim Takibi
                    </h1>
                    <p className="text-slate-500 mt-1">Kilo değişiminizi grafiklerle analiz edin.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Mevcut Kilo</p>
                    <p className="text-2xl font-bold text-blue-600">{currentWeight} <span className="text-sm text-slate-400">kg</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* SOL TARA: GRAFİK ALANI */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
                        <h3 className="text-lg font-bold text-slate-700 mb-4">Değişim Grafiği</h3>

                        {logs.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={logs}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        tick={{fontSize: 12}}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        domain={['dataMin - 2', 'dataMax + 2']} // Grafiği daraltma, değişim net görünsün
                                        stroke="#94a3b8"
                                        tick={{fontSize: 12}}
                                        unit=" kg"
                                    />
                                    <Tooltip
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        itemStyle={{color: '#2563eb', fontWeight: 'bold'}}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff"}}
                                        activeDot={{r: 6, strokeWidth: 0}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Scale size={48} className="mb-2 opacity-20" />
                                <p>Henüz veri girişi yapılmamış.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SAĞ TARAF: FORM VE LİSTE */}
                <div className="space-y-6">

                    {/* EKLEME FORMU */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus size={20} /> Yeni Kayıt Ekle
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-blue-100 uppercase tracking-wider">Tarih</label>
                                <div className="relative mt-1">
                                    <Calendar className="absolute left-3 top-3 text-blue-600" size={18} />
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-blue-100 uppercase tracking-wider">Kilo (kg)</label>
                                <div className="relative mt-1">
                                    <Scale className="absolute left-3 top-3 text-blue-600" size={18} />
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        placeholder="Örn: 82.5"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition shadow-lg active:scale-95">
                                Kaydet
                            </button>
                        </form>
                    </div>

                    {/* GEÇMİŞ LİSTESİ */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Geçmiş Kayıtlar</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {logs.slice().reverse().map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition group border border-transparent hover:border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 text-xs font-bold shadow-sm">
                                            Kg
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{log.weight} kg</p>
                                            <p className="text-xs text-slate-500">{log.date}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(log.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {logs.length === 0 && <p className="text-xs text-center text-slate-400 py-4">Liste boş.</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ProgressPage;