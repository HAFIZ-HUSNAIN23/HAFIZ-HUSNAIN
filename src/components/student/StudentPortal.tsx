import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../api/client.js';
import { ChallanPrintModal } from '../common/ChallanPrintModal.js';
import { FeeChallan, Student, DailyReport, AttendanceRecord, Result, Exam, Timing, Announcement, DayReportItem, ReportSummary30 } from '../../types.js';
import { 
  User, Award, CalendarCheck, TrendingUp, CreditCard, Calendar, Clock, Bell, 
  LogOut, Home, Printer, BookOpen, CheckCircle, XCircle, ChevronRight, Menu, X, Shield
} from 'lucide-react';

interface Props {
  onNavigateHome: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const StudentPortal: React.FC<Props> = ({ onNavigateHome, activeTab: propTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  
  const normalizeTab = (t?: string): 'overview' | 'results' | 'attendance' | 'progress' | 'fees' | 'exams' | 'timings' | 'announcements' => {
    if (t === 'dashboard' || t === 'profile') return 'overview';
    if (t === 'fee-challan' || t === 'challans') return 'fees';
    if (['overview', 'results', 'attendance', 'progress', 'fees', 'exams', 'timings', 'announcements'].includes(t || '')) {
      return t as any;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'attendance' | 'progress' | 'fees' | 'exams' | 'timings' | 'announcements'>(() => normalizeTab(propTab));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (propTab) {
      setActiveTab(normalizeTab(propTab));
    }
  }, [propTab]);

  // Loaded data
  const [profile, setProfile] = useState<Student | null>(null);
  const [target, setTarget] = useState<any>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary30 | null>(null);
  const [timeline30, setTimeline30] = useState<DayReportItem[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [challans, setChallans] = useState<FeeChallan[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [timings, setTimings] = useState<Timing[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [profData, resData, attData, chalData, examData, timeData, annData] = await Promise.all([
        apiRequest<{ student: Student; target: any; reports: DailyReport[]; summary?: ReportSummary30; timeline30?: DayReportItem[] }>('/api/student/profile'),
        apiRequest<Result[]>('/api/student/results'),
        apiRequest<AttendanceRecord[]>('/api/student/attendance'),
        apiRequest<FeeChallan[]>('/api/student/challans'),
        apiRequest<Exam[]>('/api/student/exams'),
        apiRequest<Timing[]>('/api/student/timings'),
        apiRequest<Announcement[]>('/api/student/announcements'),
      ]);

      setProfile(profData.student);
      setTarget(profData.target);
      setReports(profData.reports || []);
      if (profData.summary) setSummary(profData.summary);
      if (profData.timeline30) setTimeline30(profData.timeline30);
      setResults(resData);
      setAttendance(attData);
      setChallans(chalData);
      setExams(examData);
      setTimings(timeData);
      setAnnouncements(annData);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleLogout = () => {
    logout();
    onNavigateHome();
  };

  const navItems = [
    { id: 'overview', label: 'My Profile & Target', icon: User },
    { id: 'progress', label: '30-Day Progress & Reports', icon: TrendingUp },
    { id: 'results', label: 'Exam Results', icon: Award },
    { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
    { id: 'fees', label: 'Fee Challan & Print', icon: CreditCard },
    { id: 'exams', label: 'Exams & Date Sheet', icon: Calendar },
    { id: 'timings', label: 'Class Timings', icon: Clock },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Loading Student Quranic Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-900/60 md:hidden" />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-emerald-950 text-white flex flex-col justify-between transition-transform duration-200 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          {/* Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-amber-400/40 flex items-center justify-center font-arabic text-amber-300 font-bold text-lg">
                ق
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Student Portal</span>
                <h2 className="text-xs font-bold font-serif-title text-white truncate max-w-[150px]" title="Madrassa Arabiyyah Misbah Ul Quran For Huffaz">
                  Madrassa Arabiyyah Misbah Ul Quran For Huffaz
                </h2>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-emerald-300 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav list */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`student-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    onSelectTab?.(item.id);
                    setMobileMenuOpen(false);
                  }}
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

        {/* Footer actions */}
        <div className="p-3 border-t border-emerald-900 bg-emerald-950/80">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 text-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-white block truncate">{profile?.name || user?.name}</span>
              <span className="text-[10px] text-emerald-300 block truncate">ID: {profile?.student_id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onNavigateHome}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <button
              onClick={handleLogout}
              id="student-logout-btn"
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Student Portal
              </span>
              <h1 className="text-base font-bold text-slate-900 capitalize">
                {navItems.find(m => m.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:block text-slate-500">
              Welcome, <strong className="text-emerald-900">{profile?.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-xl font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Panels */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW & PROFILE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Target Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-arabic text-amber-300 font-bold block mb-1">
                      حَمَلَةُ القُرْآنِ الكَرِيم
                    </span>
                    <h2 className="text-2xl font-bold font-serif-title">
                      {profile?.name} (طالب علم)
                    </h2>
                    <p className="text-xs text-emerald-200 mt-1">
                      Course: <strong>{profile?.course}</strong> • Section: <strong>{profile?.class_name}</strong> • Student ID: <strong>{profile?.student_id}</strong>
                    </p>
                  </div>

                  <div className="bg-emerald-950/60 p-4 rounded-xl border border-amber-400/30 text-right sm:min-w-[180px]">
                    <span className="text-[10px] text-emerald-300 uppercase block font-bold">Current Target ({target?.duration_days || 30} Days)</span>
                    <div className="text-2xl font-bold text-amber-400">{target?.target_paras || 2} Paras</div>
                    <span className="text-[10px] text-emerald-200">{target?.start_date} to {target?.end_date}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 pt-4 border-t border-emerald-800/60">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span>Memorized / Read: <strong>{(target?.total_read || 0).toFixed(2)} Paras</strong></span>
                    <span className="text-amber-300 font-bold">{target?.progress_percent || 0}% Completed</span>
                  </div>
                  <div className="w-full bg-emerald-950 rounded-full h-3 overflow-hidden border border-emerald-700/50">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(target?.progress_percent || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Personal Academic Profile</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Father's Name</span>
                    <span className="font-bold text-slate-800 text-sm">{profile?.father_name}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                    <span className="font-bold text-slate-800 text-sm">{profile?.dob || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Gender</span>
                    <span className="font-bold text-slate-800 text-sm">{profile?.gender || 'Male'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Contact Number</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">{profile?.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Admission Date</span>
                    <span className="font-bold text-slate-800 text-sm">{profile?.admission_date}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Monthly Fee</span>
                    <span className="font-bold text-emerald-900 text-sm">PKR {profile?.monthly_fee}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2 md:col-span-3">
                    <span className="text-slate-400 block text-[10px]">Residential Address</span>
                    <span className="font-semibold text-slate-800">{profile?.address}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROGRESS & DAILY REPORTS */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              
              {/* Target Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target Goal</span>
                  <span className="text-lg font-bold text-amber-600">{target?.target_paras || 2} Paras</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Recited</span>
                  <span className="text-lg font-bold text-emerald-900">{(target?.total_read || 0).toFixed(2)} Paras</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cycle Duration</span>
                  <span className="text-lg font-bold text-slate-800">{target?.duration_days || 30} Days</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cycle Period</span>
                  <span className="text-xs font-bold text-slate-700 block truncate mt-1">
                    {target?.start_date} to {target?.end_date}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Progress %</span>
                  <span className="text-lg font-bold text-emerald-800">{target?.progress_percent || 0}%</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Status</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    (target?.progress_percent || 0) >= 100 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {target?.status || 'In Progress'}
                  </span>
                </div>
              </div>

              {/* Target Timeline Grid */}
              {timeline30 && timeline30.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span>Sabaq Breakdown (Day 1 to {timeline30.length})</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      Cycle: {target?.start_date} to {target?.end_date}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                    {timeline30.map((d) => (
                      <div
                        key={d.dayIndex}
                        className={`p-3 rounded-xl border text-xs ${
                          d.hasReport
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            d.hasReport ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            Day {d.dayIndex}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{d.date.slice(5)}</span>
                        </div>
                        {d.hasReport ? (
                          <div className="space-y-0.5 mt-1.5">
                            <div className="font-bold text-emerald-950 text-xs">{d.readingAmount.toFixed(2)} Paras</div>
                            <div className="text-[10px] text-emerald-800 font-medium">
                              {d.entries && d.entries.length > 1
                                ? `${d.entries.length} Paras: ${d.entries.map(e => `P${e.paraNo}`).join(', ')}`
                                : `Para ${d.paraNo}`}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">سامع: {d.listener}</div>
                          </div>
                        ) : (
                          <div className="py-2 text-center text-[10px] text-slate-400 italic">
                            No Sabaq
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sabaq History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>My 30-Day Sabaq History (روزنامچہ)</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Para No.</th>
                        <th className="py-2.5 px-4">مقدارِ خواندگی</th>
                        <th className="py-2.5 px-4">سامع (Listener)</th>
                        <th className="py-2.5 px-4">غلطی (Mistakes)</th>
                        <th className="py-2.5 px-4">اٹکاں (Stumbles)</th>
                        <th className="py-2.5 px-4">Notes (ملاحظات)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No daily reports recorded yet.
                          </td>
                        </tr>
                      ) : (
                        reports.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-900">{r.report_date}</td>
                            <td className="py-2.5 px-4 font-medium text-emerald-900">Para {r.para_no}</td>
                            <td className="py-2.5 px-4 font-bold text-emerald-800">{r.reading_amount.toFixed(2)} Paras</td>
                            <td className="py-2.5 px-4 text-slate-700">{r.listener}</td>
                            <td className="py-2.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.mistakes === 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.mistakes}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.stumbles === 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {r.stumbles}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 italic max-w-xs truncate">
                              {r.notes || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESULTS */}
          {activeTab === 'results' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-700" />
                <span>My Examination Results & Grades</span>
              </h3>

              {results.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No examination results recorded yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((res) => (
                    <div key={res.id} className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-950 text-sm">{res.exam_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-purple-200 text-purple-900">
                          Grade: {res.grade}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Subject: <strong>{res.subject}</strong> • Date: {res.exam_date}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-purple-200/60 font-bold">
                        <span>Score: {res.marks} / {res.total_marks}</span>
                        <span className="text-purple-900 text-sm">{res.percentage}%</span>
                      </div>
                      {res.remarks && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-purple-100 mt-2">
                          Teacher Feedback: {res.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-700" />
                  <span>My Attendance Records</span>
                </h3>
                <span className="text-xs text-slate-500">Total Records: {attendance.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Course</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">No attendance records yet.</td>
                      </tr>
                    ) : (
                      attendance.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-800">{att.attendance_date}</td>
                          <td className="py-2.5 px-4 text-emerald-900 font-medium">{att.course}</td>
                          <td className="py-2.5 px-4 text-slate-500">{att.class_name}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              att.status === 'Present'
                                ? 'bg-green-100 text-green-800'
                                : att.status === 'Absent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: FEE CHALLANS */}
          {activeTab === 'fees' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>My Fee Challans & Printable Receipts</span>
              </h3>

              {challans.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No fee challans issued yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challans.map((ch) => (
                    <div key={ch.id} className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-950 text-sm">{ch.challan_no}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          ch.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ch.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>Month / Year:</span>
                          <span className="font-semibold text-slate-800">{ch.month} {ch.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Issue Date:</span>
                          <span>{ch.issue_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due Date (10th):</span>
                          <span className="text-red-700 font-semibold">{ch.due_date}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-950 text-sm pt-2 border-t border-amber-200">
                          <span>Amount:</span>
                          <span>PKR {ch.fee_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedChallan(ch)}
                        id={`student-print-challan-${ch.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Official 3-Copy Challan</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EXAMS */}
          {activeTab === 'exams' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>Upcoming Exams Schedule & Date Sheet</span>
              </h3>

              {exams.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No exams scheduled for your course.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exams.map((ex) => (
                    <div key={ex.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 text-sm">{ex.exam_name}</h4>
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                          {ex.course}
                        </span>
                      </div>
                      <div className="text-slate-600 space-y-1">
                        <div>Date: <strong className="text-slate-800">{ex.exam_date}</strong></div>
                        <div>Timing: <strong>{ex.start_time} - {ex.end_time}</strong></div>
                        <div>Venue: <strong>{ex.venue}</strong></div>
                      </div>
                      {ex.remarks && (
                        <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                          Instructions: {ex.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TIMINGS */}
          {activeTab === 'timings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Madrasa Course Timings & Schedule</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timings.map((tm) => (
                  <div key={tm.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-sm">{tm.course}</h4>
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                        {tm.days}
                      </span>
                    </div>
                    <div className="text-slate-600 space-y-1">
                      <div>Timing: <strong className="text-slate-800">{tm.start_time} - {tm.end_time}</strong></div>
                      <div>Room / Hall: <strong>{tm.room}</strong></div>
                    </div>
                    {tm.notes && (
                      <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                        {tm.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Madrasa Circulars & Notices</span>
              </h3>

              {announcements.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No announcements published.</p>
              ) : (
                announcements.map((an) => (
                  <div key={an.id} className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-amber-950 text-sm">{an.title}</h4>
                      <span className="text-[10px] text-slate-400">{an.date}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{an.message}</p>
                  </div>
                ))
              )}
            </div>
          )}

        </main>

      </div>

      {/* 3-Copy Printable Challan Modal */}
      {selectedChallan && (
        <ChallanPrintModal
          challan={selectedChallan}
          onClose={() => setSelectedChallan(null)}
        />
      )}

    </div>
  );
};
