import React from 'react';
import { MapPin, Phone, Mail, Clock, Heart, Shield } from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-800/40 relative overflow-hidden">
      {/* Decorative Top Accent */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Madrasa Identity */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-800/80 border border-amber-400/40 flex items-center justify-center font-arabic text-amber-300 text-xl font-bold">
                ق
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-serif-title tracking-wide">
                  Madrassa Arabiyyah Misbah Ul Quran For Huffaz
                </h3>
                <span className="text-[11px] text-amber-400 font-arabic font-semibold">
                  مَدْرَسَة عَرَبِيَّة مِصْبَاحُ القُرْآن لِلْحُفَّاظ
                </span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed mb-4">
              Dedicated to nurturing young minds with the divine light of the Holy Quran, fostering exemplary tajweed, discipline, and authentic Islamic character in a serene environment.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Certified Classical Curriculum</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  About Madrasa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Quranic Courses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admission')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Online Admission Form
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Contact & Location
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-amber-300 transition-colors cursor-pointer font-semibold text-amber-400"
                >
                  Portal Login (Admin / Student)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Courses Offered */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2">
              Our Courses
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-200">
              <li className="flex items-center justify-between">
                <span>1. Nazra Quran</span>
                <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-amber-300">Mon - Sat</span>
              </li>
              <li className="flex items-center justify-between">
                <span>2. Hifzul Quran</span>
                <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-amber-300">Mon - Sat</span>
              </li>
              <li className="flex items-center justify-between">
                <span>3. Gardaan (Arabic Grammar)</span>
                <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-amber-300">Mon - Sat</span>
              </li>
              <li className="flex items-center justify-between">
                <span>4. Tajweed (Makharij & Rules)</span>
                <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-amber-300">Mon - Sat</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Address */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2">
              Get In Touch
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Umer Medical Store, Karmanwala Bazar, Kot Lakhpat Station, Lahore
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:03224616821" className="hover:text-amber-300">03224616821</a>
                  <a href="tel:03314925285" className="hover:text-amber-300">03314925285</a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:h26195467@gmail.com" className="hover:text-amber-300 truncate">
                  h26195467@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300 gap-4">
          <p>© {new Date().getFullYear()} Madrassa Arabiyyah Misbah Ul Quran For Huffaz. All rights reserved.</p>
          <div className="flex items-center gap-2 font-arabic text-amber-300 text-sm">
            <span>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
