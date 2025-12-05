import React from "react";

const Logo = ({ className = "w-10 h-10", iconColor = "text-white", bgColor = "bg-blue-600" }) => {
    return (
        <div className={`flex items-center justify-center rounded-xl shadow-lg ${className} ${bgColor}`}>
            {/* SVG İKONU: Nabız ve Hareket */}
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={iconColor}
            >
                {/* Şimşek / Nabız Benzeri Modern Bir Çizgi */}
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        </div>
    );
};

export const LogoText = ({ size = "text-2xl", color = "text-slate-900" }) => {
    return (
        <div className="flex items-center gap-3">
            {/* Logoyu çağırıyoruz */}
            <Logo className="w-10 h-10" />

            {/* Yazı Kısmı */}
            <span className={`font-bold tracking-tight ${size} ${color}`}>
            Fit<span className="text-blue-600">Track</span>
        </span>
        </div>
    );
};

export default Logo;