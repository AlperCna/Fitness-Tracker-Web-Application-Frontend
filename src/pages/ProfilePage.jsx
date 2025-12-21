import { useState, useEffect } from "react";
import { User, Mail, Ruler, Weight, Calendar, Save, Calculator, Activity, Loader2 } from "lucide-react";
import { getProgressLogs, addProgressLog } from "../services/api";

function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [user, setUser] = useState({
        name: "",
        email: "",
        height: "",
        weight: "",
        age: "",
        gender: "male"
    });

    const [bmi, setBmi] = useState(null);
    const [bmiStatus, setBmiStatus] = useState("");

    // --- 1. VERİLERİ YÜKLEME ---
    useEffect(() => {
        const loadData = async () => {
            try {
                // A. Emaili al ve ona özel Key oluştur
                const storedEmail = localStorage.getItem("email") || "misafir@fitness.com";
                const nameFromEmail = storedEmail.split("@")[0].charAt(0).toUpperCase() + storedEmail.split("@")[0].slice(1);

                //  Herkesin kendi kutusu olsun (profile_ahmet@mail.com gibi)
                const storageKey = `userProfile_${storedEmail}`;
                const savedProfile = JSON.parse(localStorage.getItem(storageKey)) || {};

                // B. Backend'den Kilo Geçmişini Çek
                // (Backend zaten Token sayesinde kimin istediğini biliyor, karışmaz)
                const res = await getProgressLogs();
                const logs = res.data;

                let latestWeight = "";
                if (logs && logs.length > 0) {
                    const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
                    latestWeight = sortedLogs[0].weight;
                }

                // C. State'i Güncelle
                setUser(prev => ({
                    ...prev,
                    email: storedEmail,
                    name: nameFromEmail,
                    height: savedProfile.height || "",
                    age: savedProfile.age || "",
                    gender: savedProfile.gender || "male",
                    weight: latestWeight || savedProfile.weight || ""
                }));

            } catch (err) {
                console.error("Veri yüklenemedi:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- 2. CANLI BMI HESAPLAMA ---
    useEffect(() => {
        if (user.height && user.weight) {
            const heightInMeters = user.height / 100;
            const weightVal = parseFloat(user.weight);
            const bmiValue = (weightVal / (heightInMeters * heightInMeters)).toFixed(1);

            setBmi(bmiValue);

            if (bmiValue < 18.5) setBmiStatus("Zayıf");
            else if (bmiValue < 24.9) setBmiStatus("Normal");
            else if (bmiValue < 29.9) setBmiStatus("Fazla Kilolu");
            else setBmiStatus("Obez");
        } else {
            setBmi(null); // Veri silinirse kartı gizle
        }
    }, [user.height, user.weight]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    // --- 3. KAYDETME İŞLEMİ ---
    const handleSave = async () => {
        setSaving(true);
        try {
            // 🔥 ÖNEMLİ DEĞİŞİKLİK: Kaydederken de Emaile özel isimle kaydediyoruz
            const storageKey = `userProfile_${user.email}`;

            localStorage.setItem(storageKey, JSON.stringify({
                height: user.height,
                age: user.age,
                gender: user.gender,
                weight: user.weight
            }));

            // B. Kiloyu Backend'e gönder (Backend zaten token'dan user'ı tanır)
            if (user.weight) {
                const today = new Date().toISOString().split('T')[0];
                await addProgressLog({
                    date: today,
                    weight: parseFloat(user.weight)
                });
            }

            alert("Profilin başarıyla güncellendi! 🎉");

        } catch (error) {
            console.error("Kayıt hatası:", error);
            alert("Hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fadeIn">

            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profilim</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* --- SOL KART --- */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="relative z-10 -mt-4">
                            <div className="w-24 h-24 bg-white p-1 rounded-full mx-auto shadow-md">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                    alt="avatar"
                                    className="w-full h-full rounded-full bg-slate-100"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mt-3">{user.name}</h2>
                            <p className="text-slate-500 text-sm">{user.email}</p>
                            <div className="mt-6 flex justify-center gap-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wide border border-blue-100">
                                    Sporcu
                                </span>
                            </div>
                        </div>
                    </div>

                    {bmi && (
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-500 group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-2">
                                    <Calculator size={16}/> Vücut Kitle Endeksi
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black tracking-tight">{bmi}</span>
                                    <span className="text-lg font-medium text-slate-400 mb-1">BMI</span>
                                </div>
                                <p className={`mt-2 font-bold text-lg 
                                    ${bmiStatus === "Normal" ? "text-green-400" :
                                    bmiStatus === "Fazla Kilolu" ? "text-orange-400" : "text-red-400"}`}>
                                    {bmiStatus}
                                </p>
                            </div>
                            <Activity className="absolute bottom-[-20px] right-[-20px] text-white/5 w-40 h-40 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    )}
                </div>

                {/* --- SAĞ FORM --- */}
                <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Fiziksel Bilgiler</h3>
                            <p className="text-slate-500 text-sm">Vücut analizi için bilgileri güncelleyebilirsin.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Boy */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                <Ruler size={14}/> Boy (cm)
                            </label>
                            <input
                                type="number"
                                name="height"
                                placeholder="180"
                                value={user.height}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-700"
                            />
                        </div>

                        {/* Kilo */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                <Weight size={14}/> Kilo (kg)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    name="weight"
                                    placeholder="80"
                                    value={user.weight}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-700 shadow-sm"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">KG</span>
                            </div>
                        </div>

                        {/* Yaş */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                <Calendar size={14}/> Yaş
                            </label>
                            <input
                                type="number"
                                name="age"
                                placeholder="25"
                                value={user.age}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-700"
                            />
                        </div>

                        {/* Cinsiyet */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Cinsiyet</label>
                            <select
                                name="gender"
                                value={user.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-700 cursor-pointer"
                            >
                                <option value="male">Erkek</option>
                                <option value="female">Kadın</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                <Mail size={14}/> E-Posta Adresi
                            </label>
                            <input
                                type="text"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                            {saving ? "Kaydediliyor..." : "Bilgileri Güncelle"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;