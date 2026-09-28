import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { Student } from '../../types.js';
import { TrendingUp, Target, Search, CheckCircle2, Clock, BookOpen, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react';

interface EnrichedProgressStudent extends Partial<Student> {
  id?: number;
  student_id: string;
  name?: string;
  student_name?: string;
  father_name?: string;
  course?: string;
  class_name?: string;
  target_paras?: number;
  total_read?: number;
  progress_percent?: number;
  target_status?: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  days_completed?: number;
  days_remaining?: number;
  average_per_day?: number;
  report_count?: number;
}

export const AdminProgress: React.FC = () => {
  const [students, setStudents] = useState<EnrichedProgressStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<EnrichedProgressStudent[]>('/api/admin/progress');
      setStudents(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch progress records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const filtered = (students || []).filter(s => {
    if (!s) return false;
    const q = (search || '').toLowerCase().trim();
    if (!q) return true;
    const name = String(s.name || s.student_name || '').toLowerCase();
    const id = String(s.student_id || '').toLowerCase();
    const course = String(s.course || '').toLowerCase();
    return name.includes(q) || id.includes(q) || course.includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Progress & Target Tracking</h2>
              <p className="text-xs text-slate-500">
                Every student maintains an independent target and duration (e.g. 2 Paras in 30 days, 10 Paras in 40 days) with automated tracking
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student, ID, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-none w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4">Target Goal</th>
                <th className="py-3 px-4">Total Recited</th>
                <th className="py-3 px-4">Cycle Duration</th>
                <th className="py-3 px-4">Avg / Day</th>
                <th className="py-3 px-4">Progress %</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 min-w-[160px]">Target Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Loading student progress calculations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    No student progress records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const percent = s.progress_percent || 0;
                  const isCompleted = percent >= 100;
                  const duration = s.duration_days || 30;
                  const daysCompleted = s.days_completed ?? 0;
                  const daysRemaining = s.days_remaining ?? duration;

                  return (
                    <tr key={s.id || s.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-emerald-950">
                        {s.student_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {s.name || s.student_name || 'Student'}
                        <span className="block text-[10px] text-slate-400 font-normal">s/o {s.father_name || '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-emerald-800">{s.course}</span>
                        <span className="block text-[10px] text-slate-400">{s.class_name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-700">
                        {s.target_paras || 2} Paras
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {s.duration_days || 30} Days ({s.start_date || (s as any).target_start_date ? `${s.start_date || (s as any).target_start_date} to ${s.end_date || (s as any).target_end_date}` : 'Cycle'})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {(s.total_read || 0).toFixed(2)} Paras
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">Day {daysCompleted} / {duration}</span>
                        <span className="block text-[10px] text-slate-400">
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Cycle ended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-900">
                        {(s.average_per_day || 0).toFixed(2)} Paras
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-800 text-sm">
                        {percent}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted ? 'bg-green-100 text-green-800' : (s.total_read && s.total_read > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')
                        }`}>
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{s.status || 'In Progress'}</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-green-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
