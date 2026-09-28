import React, { useState, useEffect } from 'react';
import { apiRequest, apiFetch } from '../../api/client.js';
import { Student, DailyReport, StudentTarget, DayReportItem, ReportSummary30 } from '../../types.js';
import { 
  FileText, Search, Save, CheckCircle, AlertCircle, Calendar, 
  User, BookOpen, Clock, TrendingUp, History, Trash2, Edit3,
  Eye, Plus, X, AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';

export const AdminDailyReport: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentData, setStudentData] = useState<{
    student: Student;
    target: StudentTarget;
    reports: DailyReport[];
    summary: ReportSummary30;
    timeline30: DayReportItem[];
  } | null>(null);

  const [loadingStudent, setLoadingStudent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State & Multi-Para Entry
  const [showForm, setShowForm] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [defaultListener, setDefaultListener] = useState('Qari Ahmad');
  const [entries, setEntries] = useState<Array<{
    paraNo: number;
    readingAmount: number;
    listener: string;
    mistakes: number;
    stumbles: number;
    notes: string;
  }>>([
    { paraNo: 1, readingAmount: 0.25, listener: 'Qari Ahmad', mistakes: 0, stumbles: 0, notes: '' }
  ]);

  // Modals
  const [viewingReport, setViewingReport] = useState<DailyReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<DailyReport | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    existingReport: DailyReport | null;
    existingReports?: DailyReport[];
    message?: string;
  }>({ isOpen: false, existingReport: null });

  // Target Edit Modal (Individual Target Days & Miqdaar)
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetParasInput, setTargetParasInput] = useState<number>(2);
  const [targetDaysInput, setTargetDaysInput] = useState<number>(30);
  const [targetStartDateInput, setTargetStartDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [savingTarget, setSavingTarget] = useState(false);

  // Active View Tab: 'reports' | 'timeline'
  const [historyTab, setHistoryTab] = useState<'reports' | 'timeline'>('reports');

  // Generate 0.25 increments up to 30.00
  const readingIncrements: number[] = [];
  for (let i = 0; i <= 3000; i += 25) {
    readingIncrements.push(i / 100);
  }

  const getCalculatedEndDate = (startDate: string, durationDays: number): string => {
    if (!startDate) return '';
    try {
      const d = new Date(startDate + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() + (Math.max(1, durationDays) - 1));
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Load students list
  useEffect(() => {
    apiRequest<Student[]>('/api/admin/students')
      .then((data) => {
        setStudents(data);
        if (data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(data[0].student_id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch full student report & target history
  const loadStudentReportHistory = async (studentId: string) => {
    if (!studentId) return;
    try {
      setLoadingStudent(true);
      setError('');
      const data = await apiRequest<{
        student: Student;
        target: StudentTarget;
        reports: DailyReport[];
        summary: ReportSummary30;
        timeline30: DayReportItem[];
      }>(`/api/admin/daily-reports/student/${studentId}`);

      setStudentData(data);
      if (data.target) {
        setTargetParasInput(data.target.target_paras || 2);
        setTargetDaysInput(data.target.duration_days || data.target.target_duration_days || 30);
        setTargetStartDateInput(data.target.start_date || new Date().toISOString().split('T')[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load student reports.');
    } finally {
      setLoadingStudent(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentReportHistory(selectedStudentId);
    }
  }, [selectedStudentId]);

  const resetForm = () => {
    setEditingReportId(null);
    setReportDate(new Date().toISOString().split('T')[0]);
    setEntries([
      { paraNo: 1, readingAmount: 0.25, listener: defaultListener || 'Qari Ahmad', mistakes: 0, stumbles: 0, notes: '' }
    ]);
    setShowForm(false);
  };

  const openAddForm = (prefilledDate?: string) => {
    if (students.length === 0) {
      setError('No students available. Please add students in the Student Directory first.');
      return;
    }
    setEditingReportId(null);
    setReportDate(prefilledDate || new Date().toISOString().split('T')[0]);
    setEntries([
      { paraNo: 1, readingAmount: 0.25, listener: defaultListener || 'Qari Ahmad', mistakes: 0, stumbles: 0, notes: '' }
    ]);
    setShowForm(true);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const openEditForm = (report: DailyReport) => {
    setEditingReportId(report.id);
    setReportDate(report.report_date);
    setEntries([{
      paraNo: report.para_no,
      readingAmount: report.reading_amount,
      listener: report.listener,
      mistakes: report.mistakes,
      stumbles: report.stumbles,
      notes: report.notes || '',
    }]);
    setShowForm(true);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const addParaEntry = () => {
    setEntries(prev => {
      const lastPara = prev.length > 0 ? prev[prev.length - 1].paraNo : 1;
      const nextPara = lastPara < 30 ? lastPara + 1 : 1;
      const lastListener = prev.length > 0 ? prev[prev.length - 1].listener : (defaultListener || 'Qari Ahmad');
      return [
        ...prev,
        {
          paraNo: nextPara,
          readingAmount: 0.25,
          listener: lastListener,
          mistakes: 0,
          stumbles: 0,
          notes: '',
        }
      ];
    });
  };

  const removeParaEntry = (index: number) => {
    if (entries.length <= 1) return;
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const updateEntryField = (index: number, field: string, value: any) => {
    setEntries(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent, overwrite = false) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingReportId) {
        // Edit existing single report by ID
        const ent = entries[0];
        const result = await apiRequest<{
          success: boolean;
          message: string;
          target: StudentTarget;
          reports: DailyReport[];
          summary: ReportSummary30;
          timeline30: DayReportItem[];
        }>(`/api/admin/daily-reports/${editingReportId}`, {
          method: 'PUT',
          body: JSON.stringify({
            reportDate,
            paraNo: Number(ent.paraNo),
            readingAmount: Number(ent.readingAmount),
            listener: ent.listener,
            mistakes: Number(ent.mistakes),
            stumbles: Number(ent.stumbles),
            notes: ent.notes,
          }),
        });

        setSuccess('Daily report updated successfully! Progress recalculated.');
        setStudentData(prev => prev ? {
          ...prev,
          target: result.target,
          reports: result.reports,
          summary: result.summary,
          timeline30: result.timeline30,
        } : null);
        resetForm();
      } else {
        // Add new reports (support batch multi-entry on the same date)
        const result = await apiFetch<any>('/api/admin/daily-reports', {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudentId,
            reportDate,
            entries: entries.map(ent => ({
              paraNo: Number(ent.paraNo),
              readingAmount: Number(ent.readingAmount),
              listener: ent.listener,
              mistakes: Number(ent.mistakes),
              stumbles: Number(ent.stumbles),
              notes: ent.notes,
            })),
            overwrite,
          }),
        });

        if (result.status === 409 && result.data?.duplicate) {
          // Trigger duplicate warning modal
          setDuplicateModal({
            isOpen: true,
            existingReport: result.data.existingReport,
            existingReports: result.data.existingReports,
            message: result.data.message,
          });
          return;
        }

        if (!result.ok || !result.data) {
          throw new Error(result.error || result.data?.error || 'Failed to save daily report.');
        }

        const data = result.data;
        setSuccess(entries.length > 1
          ? `${entries.length} Para records saved successfully for ${reportDate}! Progress recalculated.`
          : 'Daily report saved successfully! Progress recalculated.'
        );
        setStudentData(prev => prev ? {
          ...prev,
          target: data.target,
          reports: data.reports,
          summary: data.summary,
          timeline30: data.timeline || data.timeline30,
        } : null);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save daily report.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReport) return;
    try {
      setDeleting(true);
      setError('');
      const data = await apiRequest<{
        success: boolean;
        message: string;
        target: StudentTarget;
        reports: DailyReport[];
        summary: ReportSummary30;
        timeline30: DayReportItem[];
      }>(`/api/admin/daily-reports/${deletingReport.id}`, {
        method: 'DELETE',
      });

      setSuccess('Daily report deleted and progress recalculated.');
      setStudentData(prev => prev ? {
        ...prev,
        target: data.target,
        reports: data.reports,
        summary: data.summary,
        timeline30: data.timeline30,
      } : null);
      setDeletingReport(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      setSavingTarget(true);
      setError('');
      const dur = Math.max(1, parseInt(String(targetDaysInput), 10) || 30);
      const paras = parseFloat(String(targetParasInput));

      await apiRequest(`/api/admin/targets/${selectedStudentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          targetParas: paras,
          targetDays: dur,
          durationDays: dur,
          startDate: targetStartDateInput,
        }),
      });

      setSuccess(`Target updated to ${paras} Paras in ${dur} Days successfully!`);
      setShowTargetModal(false);
      await loadStudentReportHistory(selectedStudentId);
    } catch (err: any) {
      setError(err.message || 'Failed to update target.');
    } finally {
      setSavingTarget(false);
    }
  };

  const currentStudent = studentData?.student;
  const currentTarget = studentData?.target;
  const summary = studentData?.summary;
  const reportsList = studentData?.reports || [];
  const timeline30 = studentData?.timeline30 || [];

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quranic Daily Report & 30-Day Progress</h2>
              <p className="text-xs text-slate-500">
                Daily recitation log (مقدارِ خواندگی), listener (سامع), mistakes (غلطی), stumbles (اٹکاں) & 30-day progress
              </p>
            </div>
          </div>

          {/* Student Selector & Add Report Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Student:</label>
              <select
                id="report-student-select"
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setShowForm(false);
                  setEditingReportId(null);
                }}
                className="py-2 px-3 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white font-medium min-w-[200px]"
              >
                {students.length === 0 ? (
                  <option value="">No students available</option>
                ) : (
                  students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_id} - {s.name} ({s.course})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={() => openAddForm()}
              id="add-daily-report-btn"
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add Daily Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Target & Student Details Banner */}
      {currentStudent && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Student Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-800/80 text-amber-300 text-[10px] font-bold font-mono">
                  ID: {currentStudent.student_id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-800/60 text-emerald-200 text-[10px]">
                  {currentStudent.course} • {currentStudent.class_name}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif-title mt-1">
                {currentStudent.name}
              </h3>
              <p className="text-xs text-emerald-200">
                s/o {currentStudent.father_name}
              </p>
            </div>

            {/* Target Details (Independent Duration & Target) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-emerald-950/70 p-4 rounded-xl border border-emerald-800/60">
              <div>
                <span className="text-emerald-300 text-[10px] uppercase font-bold block">
                  {currentTarget?.duration_days || 30}-Day Target
                </span>
                <div className="text-xl font-bold text-amber-400 mt-0.5">
                  {currentTarget?.target_paras || 2} Paras
                </div>
                <span className="text-[10px] text-emerald-200 block truncate">
                  {currentTarget?.start_date} to {currentTarget?.end_date}
                </span>
              </div>

              <div>
                <span className="text-emerald-300 text-[10px] uppercase font-bold block">Total Recited</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {currentTarget?.total_read || 0} Paras
                </div>
                <span className="text-[10px] text-emerald-200 block">
                  {reportsList.length} Entries Logged
                </span>
              </div>

              <div>
                <span className="text-emerald-300 text-[10px] uppercase font-bold block">Target Duration</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {currentTarget?.duration_days || 30} Days
                </div>
                <span className="text-[10px] text-emerald-200 block">
                  Avg: {summary?.averagePerReport || 0} / report
                </span>
              </div>

              <div>
                <span className="text-emerald-300 text-[10px] uppercase font-bold block">Current Progress</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-bold text-amber-300">{currentTarget?.progress_percent || 0}%</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    (currentTarget?.progress_percent || 0) >= 100 
                      ? 'bg-green-400 text-emerald-950' 
                      : ((currentTarget?.total_read || 0) > 0 ? 'bg-amber-400 text-emerald-950' : 'bg-slate-300 text-slate-800')
                  }`}>
                    {currentTarget?.status || 'In Progress'}
                  </span>
                </div>
                <button
                  onClick={() => setShowTargetModal(true)}
                  className="mt-1 text-[11px] text-amber-300 hover:text-white underline cursor-pointer inline-flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Edit Target & Days</span>
                </button>
              </div>
            </div>

          </div>

          {/* Progress Bar */}
          <div className="mt-5 pt-4 border-t border-emerald-800/60">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span>Progress towards individual target: <strong>{currentTarget?.total_read || 0} / {currentTarget?.target_paras || 2} Paras</strong></span>
              <span className="text-amber-300 font-bold">{currentTarget?.progress_percent || 0}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-3 overflow-hidden border border-emerald-700/50">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(currentTarget?.progress_percent || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Metrics Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target Goal</span>
            <span className="text-base font-bold text-amber-700">{summary.targetParas} Paras</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target Period</span>
            <span className="text-base font-bold text-slate-800">{summary.durationDays || currentTarget?.duration_days || 30} Days</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Reports Added</span>
            <span className="text-base font-bold text-emerald-800">{summary.reportsAdded}</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Days Without Report</span>
            <span className="text-base font-bold text-red-600">{summary.daysWithoutReport}</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Recited</span>
            <span className="text-base font-bold text-slate-900">{summary.totalRead} Paras</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Average / Day</span>
            <span className="text-base font-bold text-emerald-900">
              {summary.averagePerDay !== undefined ? summary.averagePerDay : summary.averagePerReport} Paras
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Status</span>
            <span className="text-xs font-bold text-emerald-800 block truncate mt-0.5">{summary.status}</span>
          </div>
        </div>
      )}

      {/* Add / Edit Daily Report Form (With Multiple Paras Per Day Support) */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>{editingReportId ? 'Edit Daily Report (ترمیم روزنامچہ)' : 'New Daily Report Entry (نیا روزنامچہ)'}</span>
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={(e) => handleFormSubmit(e, false)} className="space-y-5">
            {/* Top Bar: Student & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student ID & Name
                </label>
                <input
                  type="text"
                  disabled
                  value={`${selectedStudentId} - ${currentStudent?.name || ''}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Date (تاریخ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  id="daily-report-date-input"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white font-medium"
                />
              </div>

              {!editingReportId && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Listener (سامع)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Qari Ahmad"
                    value={defaultListener}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDefaultListener(val);
                      setEntries(prev => prev.map(ent => ({
                        ...ent,
                        listener: ent.listener === defaultListener || !ent.listener ? val : ent.listener
                      })));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white font-medium"
                  />
                </div>
              )}
            </div>

            {/* Multiple Paras Entries Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Para Recitation Records ({entries.length})</span>
                    <span className="text-emerald-800 text-[11px] font-semibold">
                      • Total Session Reading: {entries.reduce((acc, e) => acc + (Number(e.readingAmount) || 0), 0).toFixed(2)} Paras
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    A student can recite multiple Paras on the same date. Each Para is saved as an independent record under this student and date.
                  </p>
                </div>

                {!editingReportId && (
                  <button
                    type="button"
                    onClick={addParaEntry}
                    id="add-another-para-btn"
                    className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors w-fit shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Para</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-800 text-white font-bold text-[11px]">
                          Para Record #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-emerald-900">
                          Para {entry.paraNo} — {Number(entry.readingAmount).toFixed(2)} Paras
                        </span>
                      </div>
                      {entries.length > 1 && !editingReportId && (
                        <button
                          type="button"
                          onClick={() => removeParaEntry(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      {/* Quran Para No */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Para No. (پارہ نمبر) <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={entry.paraNo}
                          onChange={(e) => updateEntryField(index, 'paraNo', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none bg-white font-medium"
                        >
                          {Array.from({ length: 30 }, (_, i) => i + 1).map((p) => (
                            <option key={p} value={p}>
                              Para {p} ({p === 1 ? 'Alif Lam Meem' : p === 30 ? 'Amma' : `Para ${p}`})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* مقدارِ خواندگی (0.25 increments) */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          مقدارِ خواندگی (Paras) <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={entry.readingAmount}
                          onChange={(e) => updateEntryField(index, 'readingAmount', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none bg-white font-bold text-emerald-900"
                        >
                          {readingIncrements.map((inc) => (
                            <option key={inc} value={inc}>
                              {inc.toFixed(2)} Paras {inc === 0.25 ? '(Paao)' : inc === 0.5 ? '(Half)' : inc === 0.75 ? '(Three-Quarters)' : inc === 1.0 ? '(Full Para)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* سامع (Listener) */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          سامع (Listener) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Qari Ahmad"
                          value={entry.listener}
                          onChange={(e) => updateEntryField(index, 'listener', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
                        />
                      </div>

                      {/* غلطی (Mistakes) */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          غلطی (Mistakes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={entry.mistakes}
                          onChange={(e) => updateEntryField(index, 'mistakes', Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-medium"
                        />
                      </div>

                      {/* اٹکاں (Stumbles) */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          اٹکاں (Stumbles)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={entry.stumbles}
                          onChange={(e) => updateEntryField(index, 'stumbles', Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-medium"
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Notes (ملاحظات)
                        </label>
                        <input
                          type="text"
                          placeholder="Optional notes"
                          value={entry.notes}
                          onChange={(e) => updateEntryField(index, 'notes', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!editingReportId && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={addParaEntry}
                    className="px-4 py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors w-full justify-center"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>+ Add Another Para for {reportDate}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                * Note: All Para records are saved individually under this student and date.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  id="save-daily-report-btn"
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>
                    {saving
                      ? 'Saving & Calculating...'
                      : (editingReportId
                          ? 'Save Changes'
                          : `Save Daily Report (${entries.length} Para${entries.length > 1 ? 's' : ''})`
                        )
                    }
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tabs for "Previous Reports" vs "Day-by-Day Timeline" */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              historyTab === 'reports'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Previous Reports ({reportsList.length})</span>
          </button>
          <button
            onClick={() => setHistoryTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              historyTab === 'timeline'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Target Timeline Breakdown (Day 1 to {currentTarget?.duration_days || 30})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:block">
          Student ID: <strong className="text-slate-800">{selectedStudentId}</strong>
        </span>
      </div>

      {/* VIEW 1: PREVIOUS REPORTS MANAGEMENT TABLE */}
      {historyTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Previous Daily Reports for {currentStudent?.name || selectedStudentId}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {reportsList.length} Recorded Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Student ID</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Para No.</th>
                  <th className="py-2.5 px-4">مقدارِ خواندگی</th>
                  <th className="py-2.5 px-4">سامع (Listener)</th>
                  <th className="py-2.5 px-4">غلطی (Mistakes)</th>
                  <th className="py-2.5 px-4">اٹکاں (Stumbles)</th>
                  <th className="py-2.5 px-4">Contribution</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingStudent ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Loading student daily records...
                    </td>
                  </tr>
                ) : reportsList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No daily reports recorded yet for this student. Click "+ Add Daily Report" to add the first entry.
                    </td>
                  </tr>
                ) : (
                  reportsList.map((r) => {
                    const targetParas = currentTarget?.target_paras || 2;
                    const contribution = targetParas > 0 ? Math.round((r.reading_amount / targetParas) * 1000) / 10 : 0;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {r.report_date}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                          {r.student_id}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {currentStudent?.name || r.student_id}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-emerald-900 whitespace-nowrap">
                          Para {r.para_no}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-emerald-800 whitespace-nowrap">
                          {Number(r.reading_amount).toFixed(2)} Paras
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-medium">
                          {r.listener}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.mistakes === 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.mistakes} mistakes
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.stumbles === 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.stumbles} stumbles
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                          +{contribution}%
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingReport(r)}
                              id={`view-report-btn-${r.id}`}
                              className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                              title="View Report Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditForm(r)}
                              id={`edit-report-btn-${r.id}`}
                              className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                              title="Edit Report"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingReport(r)}
                              id={`delete-report-btn-${r.id}`}
                              className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Report"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* VIEW 2: DYNAMIC TIMELINE (DAY 1 TO DURATION_DAYS) */}
      {historyTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Target Timeline Breakdown (Day 1 to {currentTarget?.duration_days || 30})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cycle Period: <strong>{currentTarget?.start_date}</strong> to <strong>{currentTarget?.end_date}</strong> (All {currentTarget?.duration_days || 30} Days)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recorded ({summary?.reportsAdded || 0})
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold ml-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> No Report ({summary?.daysWithoutReport || 0})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {timeline30.map((item) => {
              const has = item.hasReport;
              const hasMultiple = item.reports && item.reports.length > 1;
              return (
                <div
                  key={item.dayIndex}
                  className={`p-3.5 rounded-xl border transition-all ${
                    has 
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-900' 
                      : 'bg-slate-50/80 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      has ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Day {item.dayIndex}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 font-mono">
                      {item.date}
                    </span>
                  </div>

                  {has && (item.report || (item.reports && item.reports.length > 0)) ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950">
                          {Number(item.readingAmount).toFixed(2)} Paras
                        </span>
                        <span className="text-[10px] text-emerald-800 font-medium truncate max-w-[100px]">
                          {hasMultiple
                            ? `${item.reports!.length} Paras (${item.paras ? item.paras.map(p => `P${p}`).join(',') : ''})`
                            : `Para ${item.paraNo}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 truncate">
                        سامع: {item.listener}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[10px]">
                        <span>{item.mistakes || 0} mist • {item.stumbles || 0} stum</span>
                        <button
                          onClick={() => setViewingReport(item.report || item.reports![0])}
                          className="text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center space-y-1">
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        No Report
                      </span>
                      <button
                        onClick={() => openAddForm(item.date)}
                        className="block w-full text-center text-[10px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer mt-1"
                      >
                        + Add for this date
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW REPORT DETAILS */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-serif-title">
                  Daily Report Details (روزنامچہ تفصیل)
                </h3>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Student Header */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-950 block text-sm">
                  {currentStudent?.name || viewingReport.student_id}
                </span>
                <span className="text-slate-600 block">
                  Student ID: {viewingReport.student_id} • Course: {currentStudent?.course} ({currentStudent?.class_name})
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Father: {currentStudent?.father_name}
                </span>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">Date (تاریخ)</span>
                  <span className="font-bold text-slate-800 text-sm">{viewingReport.report_date}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">Quran Para No. (پارہ نمبر)</span>
                  <span className="font-bold text-emerald-900 text-sm">Para {viewingReport.para_no}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">مقدارِ خواندگی (Reading)</span>
                  <span className="font-bold text-emerald-900 text-sm">{Number(viewingReport.reading_amount).toFixed(2)} Paras</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">سامع (Listener)</span>
                  <span className="font-bold text-slate-800 text-sm">{viewingReport.listener}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">غلطی (Mistakes)</span>
                  <span className="font-bold text-amber-800 text-sm">{viewingReport.mistakes} mistakes</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">اٹکاں (Stumbles)</span>
                  <span className="font-bold text-slate-800 text-sm">{viewingReport.stumbles} stumbles</span>
                </div>
              </div>

              {/* Notes */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Notes / Teacher Observations (ملاحظات)</span>
                <p className="text-slate-700 mt-1 italic">
                  {viewingReport.notes ? viewingReport.notes : 'No specific notes recorded for this daily entry.'}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const r = viewingReport;
                    setViewingReport(null);
                    openEditForm(r);
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Edit Report
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CONFIRMATION MODAL */}
      {deletingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200 p-6 space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Daily Report?</h3>
              <p className="text-slate-500">
                Are you sure you want to delete this daily report for <strong>{deletingReport.report_date}</strong> (Para {deletingReport.para_no}, {deletingReport.reading_amount} Paras)?
              </p>
              <p className="text-[11px] text-amber-700 font-medium">
                Student target progress will be recalculated immediately. Only this report will be deleted.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReport(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DUPLICATE ENTRY WARNING MODAL */}
      {duplicateModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-amber-200 p-6 space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">Duplicate Para Record Detected</h3>
              <p className="text-slate-600">
                {duplicateModal.message || (
                  <>
                    A report already exists for student <strong>{selectedStudentId}</strong> on date <strong>{reportDate}</strong> for <strong>Para {duplicateModal.existingReport?.para_no}</strong>.
                  </>
                )}
              </p>
              {duplicateModal.existingReport && (
                <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-700 block">Existing Report on this Date:</span>
                  <div>Para: <strong>{duplicateModal.existingReport.para_no}</strong> • Reading: <strong>{duplicateModal.existingReport.reading_amount} Paras</strong></div>
                  <div>Listener: <strong>{duplicateModal.existingReport.listener}</strong></div>
                </div>
              )}
              <p className="text-slate-500 text-[11px]">
                Do you want to overwrite / update the existing record with your new values?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDuplicateModal({ isOpen: false, existingReport: null })}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setDuplicateModal({ isOpen: false, existingReport: null });
                  handleFormSubmit(e, true);
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Update / Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT TARGET (DAYS & PARAS) MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-serif-title">
                  Configure Individual Target for {currentStudent?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowTargetModal(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-950 block text-sm">{currentStudent?.name}</span>
                <span className="text-slate-600">ID: {selectedStudentId} • Course: {currentStudent?.course}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Quranic Paras (مقدار پارہ جات) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="30"
                  required
                  value={targetParasInput}
                  onChange={(e) => setTargetParasInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-sm font-bold text-emerald-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Each student has an independent target (e.g. 2 Paras, 5 Paras, 10 Paras, 15 Paras, 30 Paras).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Period / Duration in Days (مدت بمطابق ایام) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={targetDaysInput}
                  onChange={(e) => setTargetDaysInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-sm font-bold text-slate-800"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Custom duration for this student (e.g. 7 days, 15 days, 30 days, 40 days, 60 days).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cycle Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={targetStartDateInput}
                  onChange={(e) => setTargetStartDateInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                />
                <p className="text-[10px] text-emerald-800 font-medium mt-1">
                  Calculated Cycle End Date: <strong>{getCalculatedEndDate(targetStartDateInput, targetDaysInput)}</strong> ({targetDaysInput} calendar days)
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTarget}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {savingTarget ? 'Saving...' : 'Save Student Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
