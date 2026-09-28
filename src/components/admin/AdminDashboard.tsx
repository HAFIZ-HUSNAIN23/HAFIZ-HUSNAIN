import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { 
  Users, UserCheck, BookOpen, CalendarCheck, CreditCard, TrendingUp, Calendar, 
  Bell, CheckCircle, Clock, AlertTriangle, ArrowRight, FileText
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () => {
    setLoading(true);
    apiRequest('/api/admin/stats')
      .then((data) => {
        setStats(data);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load statistics.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading Madrasa Dashboard Overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-arabic text-amber-300 font-bold mb-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-white">
              Executive Administration Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
              Madrassa Arabiyyah Misbah Ul Quran For Huffaz • Karmanwala Bazar, Kot Lakhpat Station, Lahore
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('daily-report')}
              id="dash-quick-daily-report-btn"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Record Daily Report
            </button>
            <button
              onClick={() => onNavigateTab('attendance')}
              id="dash-quick-attendance-btn"
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl border border-emerald-500/40 shadow-sm transition-all cursor-pointer"
            >
              Mark Attendance
            </button>
          </div>
        </div>
      </div>

      {/* 7 Key Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.totalStudents || 0}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Enrolled in system</span>
        </div>

        {/* Active Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.activeStudents || 0}</div>
          <span className="text-[11px] text-teal-600 font-medium">Regular attendance</span>
        </div>

        {/* Total Courses */}
        <div 
          onClick={() => onNavigateTab('timings')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Courses</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.totalCourses || 4}</div>
          <span className="text-[11px] text-slate-500">Nazra, Hifz, Gardaan, Tajweed</span>
        </div>

        {/* Today's Attendance */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.todayAttendance?.present || 0} <span className="text-xs text-slate-400 font-normal">/ {stats?.todayAttendance?.total || stats?.activeStudents || 0}</span>
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Marked present today</span>
        </div>

        {/* Pending Fees */}
        <div 
          onClick={() => onNavigateTab('fee-challans')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Pending Fees</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">
            PKR {stats?.pendingFees?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-rose-500 font-medium">Unpaid Challans</span>
        </div>

        {/* Average Progress */}
        <div 
          onClick={() => onNavigateTab('progress')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Average Progress</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800">{stats?.averageProgress || 0}%</div>
          <span className="text-[11px] text-slate-500">Across active targets</span>
        </div>

        {/* Upcoming Exams */}
        <div 
          onClick={() => onNavigateTab('exams')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group sm:col-span-3 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Upcoming Exams</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.upcomingExams?.length || 0} Tests Scheduled</div>
          <span className="text-[11px] text-purple-600 font-medium">Monthly assessments</span>
        </div>

      </div>

      {/* Two Column Grid: Recent Admissions & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Admissions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">Recent Online Admissions</h3>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.recentAdmissions && stats.recentAdmissions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAdmissions.map((adm: any) => (
                <div key={adm.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{adm.student_name}</span>
                    <span className="text-slate-500 ml-2">s/o {adm.father_name}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Course: <span className="font-semibold text-emerald-800">{adm.course}</span> • App #{adm.application_no}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      adm.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {adm.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{adm.admission_date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No recent admission applications received.</p>
          )}
        </div>

        {/* Upcoming Exams & Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          
          {/* Exams Sub-block */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-sm text-slate-900">Upcoming Exams / Date Sheet</h3>
              </div>
              <button
                onClick={() => onNavigateTab('exams')}
                className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats?.upcomingExams && stats.upcomingExams.length > 0 ? (
              <div className="space-y-2.5">
                {stats.upcomingExams.slice(0, 3).map((exam: any) => (
                  <div key={exam.id} className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-purple-950">{exam.exam_name}</span>
                      <div className="text-[11px] text-slate-600">
                        {exam.course} • {exam.start_time} - {exam.end_time}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-900">{exam.exam_date}</span>
                      <div className="text-[10px] text-slate-500">{exam.venue}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No scheduled upcoming exams.</p>
            )}
          </div>

          {/* Announcements Sub-block */}
          <div className="pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Published Announcements</h3>
              </div>
              <button
                onClick={() => onNavigateTab('announcements')}
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats?.announcements && stats.announcements.length > 0 ? (
              <div className="space-y-2">
                {stats.announcements.slice(0, 2).map((ann: any) => (
                  <div key={ann.id} className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-950">{ann.title}</span>
                      <span className="text-[10px] text-slate-500">{ann.date}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{ann.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-2">No announcements published.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
