import React, { useState } from 'react';
import { BookOpen, Menu, X, LogIn, LayoutDashboard, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<Props> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'courses', label: 'COURSES' },
    { id: 'admission', label: 'ADMISSION' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/40 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <button
            onClick={() => handleNav('home')}
            id="brand-logo-btn"
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-amber-400/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <span className="font-arabic text-amber-300 text-2xl font-bold">قرآن</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-widest text-amber-400 font-semibold">
                مَدْرَسَة عَرَبِيَّة مِصْبَاحُ القُرْآن
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight font-serif-title text-white">
                Madrassa Arabiyyah Misbah Ul Quran For Huffaz
              </h1>
              <p className="text-[10px] text-emerald-300 font-light hidden sm:block">
                Islamic Madrasa Lahore • Karmanwala Bazar
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNav(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800/80 text-amber-300 font-semibold border-b-2 border-amber-400'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-900/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* User / Login Action */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                id="portal-dashboard-btn"
                onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'student')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{user.role === 'admin' ? 'Admin Dashboard' : 'Student Portal'}</span>
              </button>
            ) : (
              <button
                id="nav-login-btn"
                onClick={() => handleNav('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentPage === 'login'
                    ? 'bg-amber-400 text-emerald-950 shadow-md'
                    : 'bg-emerald-800/70 hover:bg-emerald-800 text-white border border-emerald-600/40'
                }`}
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>LOGIN</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-950 border-b border-emerald-800/60 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              id={`mobile-nav-${link.id}`}
              onClick={() => handleNav(link.id)}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                currentPage === link.id
                  ? 'bg-emerald-800 text-amber-300 font-bold'
                  : 'text-emerald-100 hover:bg-emerald-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-emerald-900">
            {user ? (
              <button
                id="mobile-portal-btn"
                onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'student')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-emerald-950 font-bold text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{user.role === 'admin' ? 'Admin Dashboard' : 'Student Portal'}</span>
              </button>
            ) : (
              <button
                id="mobile-login-btn"
                onClick={() => handleNav('login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 text-white font-semibold text-sm border border-emerald-600/50"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>LOGIN</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
