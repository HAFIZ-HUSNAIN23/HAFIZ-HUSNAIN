import React from 'react';
import { BookOpen, Shield, Heart, Award, CheckCircle, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200">
            About Our Institution
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-emerald-950 mt-3 mb-4">
            Madrassa Arabiyyah Misbah Ul Quran For Huffaz
          </h2>
          <div className="text-sm font-arabic text-amber-700 font-semibold mb-3">
            مَدْرَسَة عَرَبِيَّة مِصْبَاحُ القُرْآن لِلْحُفَّاظ • لاهور
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Established with the sacred pledge to preserve the Book of Allah in the hearts and deeds of the new generation through authentic scholarship, pious mentorship, and disciplined progress.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          <div className="bg-white rounded-2xl p-8 border border-emerald-900/15 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 font-serif-title mb-3">
              Our Divine Mission
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              "Madrassa Arabiyyah Misbah Ul Quran For Huffaz is dedicated to providing quality Quranic education in a peaceful Islamic environment. Our aim is to help students learn, understand and preserve the Holy Quran with proper Tajweed, discipline and Islamic values."
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Nurture genuine love and reverence for Allah's revelations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ensure 100% accurate articulation according to classical Tajweed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Individualized 30-day Para monitoring for optimal retention</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-emerald-900/15 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 font-serif-title mb-3">
              Institutional Values & Environment
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              We provide a disciplined yet compassionate learning atmosphere where every student receives personalized attention based on their capacity and learning velocity.
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Punctuality, neatness, and Islamic adab (etiquette)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Daily listener (سامع) recitation with mistake & stumble audits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Zero administrative confusion with direct portal transparency</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-400 bg-emerald-950/60 px-3.5 py-1 rounded-full border border-amber-400/30">
              Distinctive Features
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif-title mt-3 mb-6">
              Why Choose Madrassa Arabiyyah Misbah Ul Quran For Huffaz?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-emerald-100">
              <div className="space-y-1">
                <h4 className="font-bold text-amber-300">1. Individual Student Targets</h4>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Every student has their own unique 30-day target (e.g. 2 Paras, 10 Paras, 15 Paras, 20 Paras) calculated independently without generalized pressure.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-amber-300">2. Quarter-Para Precision</h4>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Strict Quranic Para measurement in increments of 0.25 (0.25, 0.50, 0.75, 1.00) ensuring verifiable daily progress.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-amber-300">3. Transparent Fee Challans</h4>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Standardized 3-copy printable fee challans (Bank Copy, Office Copy, Student Copy) issued on the 1st with due date on the 10th.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-amber-300">4. Private Student Portal</h4>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Students and parents can securely view only their own attendance, exam results, date sheets, timings, and daily reports from any device.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
