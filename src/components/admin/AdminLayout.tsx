import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { 
  LayoutDashboard, Users, Award, CreditCard, CalendarCheck, 
  TrendingUp, FileText, Calendar, Clock, Bell, ShieldCheck, 
  LogOut, Menu, X, Home, ChevronRight, User
} from 'lucide-react';

import { AdminDashboard } from './AdminDashboard.js';
import { AdminStudents } from './AdminStudents.js';
import { AdminResults } from './AdminResults.js';
import { AdminFeeChallans } from './AdminFeeChallans.js';
import { AdminAttendance } from './AdminAttendance.js';
import { AdminProgress } from './AdminProgress.js';
import { AdminDailyReport } from './AdminDailyReport.js';
import { AdminExams } from './AdminExams.js';
import { AdminTimings } from './AdminTimings.js';
import { AdminAnnouncements } from './AdminAnnouncements.js';
import { AdminAccounts } from './AdminAccounts.js';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateHome: () => void;
}

export const AdminLayout: React.FC<Props> = ({ activeTab, onSelectTab, onNavigateHome }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'fee-challans', label: 'Fee Challans', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'daily-report', label: 'Daily Report', icon: FileText },
    { id: 'exams', label: 'Exams / Date Sheet', icon: Calendar },
    { id: 'timings', label: 'Timings', icon: Clock },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'accounts', label: 'Accounts', icon: ShieldCheck },
  ];

  const handleNav = (tabId: string) => {
    onSelectTab(tabId);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigateHome();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigateTab={handleNav} />;
      case 'students':
        return <AdminStudents />;
      case 'results':
        return <AdminResults />;
      case 'fee-challans':
        return <AdminFeeChallans />;
      case 'attendance':
        return <AdminAttendance />;
      case 'progress':
        return <AdminProgress />;
      case 'daily-report':
        return <AdminDailyReport />;
      case 'exams':
        return <AdminExams />;
      case 'timings':
        return <AdminTimings />;
      case 'announcements':
        return <AdminAnnouncements />;
      case 'accounts':
        return <AdminAccounts />;
      default:
        return <AdminDashboard onNavigateTab={handleNav} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-emerald-950 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-emerald-900/60 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-amber-400/40 flex items-center justify-center font-arabic text-amber-300 font-bold text-lg">
                ق
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Admin Portal</span>
                <h1 className="text-xs font-bold font-serif-title text-white truncate max-w-[150px]" title="Madrassa Arabiyyah Misbah Ul Quran For Huffaz">
                  Madrassa Arabiyyah Misbah Ul Quran For Huffaz
                </h1>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-emerald-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-amber-300 font-bold shadow-xs'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Logout */}
        <div className="p-3 border-t border-emerald-900 bg-emerald-950/80">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 text-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-white block truncate">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-emerald-300 block truncate">@{user?.loginId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onNavigateHome}
              id="admin-view-site-btn"
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <button
              onClick={handleLogout}
              id="admin-logout-btn"
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              id="admin-mobile-menu-btn"
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Executive Management
              </span>
              <h2 className="text-base font-bold text-slate-900 capitalize">
                {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Pakistan Standard Time: {new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Panel Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {renderContent()}
        </main>

      </div>

    </div>
  );
};
