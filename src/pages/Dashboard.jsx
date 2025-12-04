// src/pages/Dashboard.jsx

function Dashboard() {
    // Logout fonksiyonuna veya navigate'e ihtiyacımız kalmadı.
    // Çünkü bunları artık DashboardLayout.jsx yönetiyor.

    return (
        <div>
            {/* Sayfa Başlığı */}
            <h1 className="text-2xl font-bold mb-6 text-slate-800">
                Hoş Geldin! Gelişim Özeti
            </h1>

            {/* İSTATİSTİK KARTLARI (GRID YAPISI) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Kart 1: Toplam Antrenman */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        Toplam Antrenman
                    </h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-800">12</span>
                        <span className="text-sm text-green-600 font-medium mb-1">+2 bu hafta</span>
                    </div>
                </div>

                {/* Kart 2: Son Kilo */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        Güncel Kilo
                    </h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-800">82.5</span>
                        <span className="text-sm text-gray-500 mb-1">kg</span>
                    </div>
                </div>

                {/* Kart 3: Aktiflik */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        Üyelik Süresi
                    </h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-800">14</span>
                        <span className="text-sm text-gray-500 mb-1">Gün</span>
                    </div>
                </div>
            </div>

            {/* ALT BİLGİ ALANI */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-slate-700">Hızlı Başlangıç</h3>
                <p className="text-gray-600 mb-4">
                    Sol menüyü kullanarak egzersiz kütüphanesine göz atabilir veya yeni bir antrenman kaydı oluşturabilirsin.
                </p>
                <div className="p-4 bg-blue-50 rounded border border-blue-100 text-blue-800 text-sm">
                    🚀 <strong>İpucu:</strong> Antrenmanlarını düzenli kaydetmek gelişimini %40 hızlandırır.
                </div>
            </div>
        </div>
    );
}

export default Dashboard;