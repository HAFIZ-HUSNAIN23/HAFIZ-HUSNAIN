import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/public/Navbar.js';
import { Footer } from './components/public/Footer.js';
import { Hero } from './components/public/Hero.js';
import { AboutPage } from './components/public/AboutPage.js';
import { CoursesPage } from './components/public/CoursesPage.js';
import { AdmissionPage } from './components/public/AdmissionPage.js';
import { ContactPage } from './components/public/ContactPage.js';
import { LoginPage } from './components/public/LoginPage.js';
import { AdminLayout } from './components/admin/AdminLayout.js';
import { StudentPortal } from './components/student/StudentPortal.js';
import { ShieldAlert, ArrowRight } from 'lucide-react';

function getInitialRoute(): string {
  // Check hash first (e.g. #/admin/dashboard)
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash) return hash;
  
  // Check pathname (e.g. /admin/dashboard or /login)
  const path = window.location.pathname.replace(/^\//, '').trim();
  if (path && path !== 'index.html') return path;

  return 'home';
}

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);

  // Sync with browser back/forward history and hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const route = getInitialRoute();
      setCurrentRoute(route || 'home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    const cleanPath = path.replace(/^#\/?/, '').replace(/^\//, '').trim() || 'home';
    window.location.hash = `#/${cleanPath}`;
    setCurrentRoute(cleanPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If already logged in and navigating to /login, redirect to respective dashboard
  useEffect(() => {
    if (currentRoute === 'login' && isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('admin/dashboard');
      } else if (user.role === 'student') {
        navigate('student/dashboard');
      }
    }
  }, [currentRoute, isAuthenticated, user]);

  // If student attempts to access admin route, automatically redirect after brief notice
  useEffect(() => {
    if (currentRoute.startsWith('admin') && isAuthenticated && user?.role === 'student') {
      const timer = setTimeout(() => {
        navigate('student/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentRoute, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-800 border-t-amber-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-700">Loading Madrassa Arabiyyah Misbah Ul Quran For Huffaz...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN ROUTES & ROLE PROTECTION
  // -------------------------------------------------------------
  if (currentRoute.startsWith('admin')) {
    // Unauthenticated user -> redirect to Login
    if (!isAuthenticated || !user) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar currentPage="login" onNavigate={navigate} />
          <div className="flex-1">
            <LoginPage
              initialRole="admin"
              onLoginSuccess={(role) => navigate(role === 'admin' ? 'admin/dashboard' : 'student/dashboard')}
              onNavigate={navigate}
              onNavigateHome={() => navigate('home')}
            />
          </div>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    // Student attempting to access Admin URL -> Show Unauthorized Access and redirect
    if (user.role === 'student') {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-red-200 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif-title">Unauthorized Access</h2>
            <p className="text-sm text-slate-600">
              Students do not have permission to view or manage the Admin Portal. You are being redirected to your Student Dashboard...
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('student/dashboard')}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Go to Student Dashboard</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Authenticated Admin -> render Admin Dashboard & Subtabs
    const parts = currentRoute.split('/');
    const subTab = parts[1] || 'dashboard';

    return (
      <AdminLayout
        activeTab={subTab}
        onSelectTab={(tab) => navigate(`admin/${tab}`)}
        onNavigateHome={() => navigate('home')}
      />
    );
  }

  // -------------------------------------------------------------
  // STUDENT PORTAL ROUTES & ROLE PROTECTION
  // -------------------------------------------------------------
  if (currentRoute.startsWith('student')) {
    // Unauthenticated user -> redirect to Login
    if (!isAuthenticated || !user) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar currentPage="login" onNavigate={navigate} />
          <div className="flex-1">
            <LoginPage
              initialRole="student"
              onLoginSuccess={(role) => navigate(role === 'admin' ? 'admin/dashboard' : 'student/dashboard')}
              onNavigate={navigate}
              onNavigateHome={() => navigate('home')}
            />
          </div>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    const parts = currentRoute.split('/');
    const studentSubTab = parts[1] || 'overview';

    return (
      <StudentPortal
        activeTab={studentSubTab}
        onSelectTab={(tab) => navigate(`student/${tab}`)}
        onNavigateHome={() => navigate('home')}
      />
    );
  }

  // -------------------------------------------------------------
  // PUBLIC ROUTES
  // -------------------------------------------------------------
  const renderPublicPage = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <>
            <Hero onNavigate={navigate} />
            <AboutPage onNavigate={navigate} />
            <CoursesPage onNavigate={navigate} />
            <AdmissionPage onNavigate={navigate} />
            <ContactPage onNavigate={navigate} />
          </>
        );
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'courses':
        return <CoursesPage onNavigate={navigate} />;
      case 'admission':
        return <AdmissionPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'login':
        return (
          <LoginPage
            initialRole="admin"
            onLoginSuccess={(role) => navigate(role === 'admin' ? 'admin/dashboard' : 'student/dashboard')}
            onNavigate={navigate}
            onNavigateHome={() => navigate('home')}
          />
        );
      default:
        return (
          <>
            <Hero onNavigate={navigate} />
            <AboutPage onNavigate={navigate} />
            <CoursesPage onNavigate={navigate} />
            <AdmissionPage onNavigate={navigate} />
            <ContactPage onNavigate={navigate} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-700 selection:text-white">
      <Navbar currentPage={currentRoute} onNavigate={navigate} />
      <main className="flex-1">
        {renderPublicPage()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
