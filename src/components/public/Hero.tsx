import React from 'react';
import { BookOpen, UserCheck, ShieldCheck, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onNavigate: (page: string, roleHint?: 'admin' | 'student') => void;
}

export const Hero: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white min-h-[580px] flex items-center">
      {/* Haram / Masjid inspired architectural background with subtle geometric arabesque overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(217, 119, 6, 0.25) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, rgba(6, 78, 59, 0.4) 25%, transparent 25%),
            linear-gradient(225deg, rgba(6, 78, 59, 0.4) 25%, transparent 25%)`,
          backgroundSize: '100% 100%, 100% 100%, 60px 60px, 60px 60px',
        }}
      >
        {/* Islamic Arch SVG Silhouette */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <svg className="w-full max-w-4xl h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M400 50 C280 150 200 280 200 450 L200 600 L600 600 L600 450 C600 280 520 150 400 50 Z" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 6" fill="url(#arch-glow)" />
            <path d="M400 90 C300 180 230 290 230 450 L230 600 L570 600 L570 450 C570 290 500 180 400 90 Z" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="400" cy="50" r="8" fill="#fbbf24" />
            <defs>
              <linearGradient id="arch-glow" x1="400" y1="50" x2="400" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" stopOpacity="0.1" />
                <stop offset="1" stopColor="#064e3b" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
        
        {/* Arabic Bismillah Calligraphy Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/60 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-arabic tracking-wide shadow-sm mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • مَدْرَسَة عَرَبِيَّة مِصْبَاحُ القُرْآن</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif-title tracking-tight text-white mb-6 drop-shadow-md">
          Madrassa Arabiyyah Misbah Ul Quran For Huffaz
        </h1>

        {/* Subtitle / Introduction text */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-emerald-100/90 font-light leading-relaxed mb-10">
          "Madrassa Arabiyyah Misbah Ul Quran For Huffaz is dedicated to providing quality Quranic education in a peaceful Islamic environment. Our aim is to help students learn, understand and preserve the Holy Quran with proper Tajweed, discipline and Islamic values."
        </p>

        {/* 4 Required Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          
          {/* Button 1: Apply for Admission */}
          <button
            onClick={() => onNavigate('admission')}
            id="hero-apply-btn"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-emerald-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-emerald-950" />
            <span>Apply for Admission</span>
            <ArrowRight className="w-4 h-4 text-emerald-950" />
          </button>

          {/* Button 2: Student Login */}
          <button
            onClick={() => onNavigate('login', 'student')}
            id="hero-student-login-btn"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base border border-emerald-600/60 shadow-md hover:shadow-emerald-700/30 transition-all cursor-pointer"
          >
            <UserCheck className="w-5 h-5 text-amber-300" />
            <span>Student Login</span>
          </button>

          {/* Button 3: Admin Login */}
          <button
            onClick={() => onNavigate('login', 'admin')}
            id="hero-admin-login-btn"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 hover:text-white font-semibold text-sm sm:text-base border border-amber-400/40 shadow-md transition-all cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Admin Login</span>
          </button>

          {/* Button 4: View Courses */}
          <button
            onClick={() => onNavigate('courses')}
            id="hero-courses-btn"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-emerald-300" />
            <span>View Courses</span>
          </button>

        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-14 pt-8 border-t border-emerald-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
          <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/30">
            <span className="text-amber-400 font-bold text-lg block">30 Paras</span>
            <span className="text-xs text-emerald-200">30-Day Target Tracking</span>
          </div>
          <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/30">
            <span className="text-amber-400 font-bold text-lg block">4 Courses</span>
            <span className="text-xs text-emerald-200">Nazra, Hifz, Gardaan, Tajweed</span>
          </div>
          <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/30">
            <span className="text-amber-400 font-bold text-lg block">100% Secure</span>
            <span className="text-xs text-emerald-200">Role-Based Student Portal</span>
          </div>
          <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/30">
            <span className="text-amber-400 font-bold text-lg block">Lahore, PK</span>
            <span className="text-xs text-emerald-200">Kot Lakhpat Station</span>
          </div>
        </div>

      </div>
    </div>
  );
};
