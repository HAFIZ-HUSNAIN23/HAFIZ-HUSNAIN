import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { Student, AttendanceRecord } from '../../types.js';
import { 
  CalendarCheck, Save, Search, CheckCircle, AlertCircle, 
  History, Filter, Calendar, Users
} from 'lucide-react';

export const AdminAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  
  // Mark attendance state
  const [selectedCourse, setSelectedCourse] = useState('Hifzul Quran');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>({});
  const [loadingMark, setLoadingMark] = useState(false);
  const [saving, setSaving] = useState(false);

  // History state
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [histCourse, setHistCourse] = useState('');
  const [histDate, setHistDate] = useState('');
  const [histStudentId, setHistStudentId] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch students for selected course and pre-populate their attendance for the date
  const loadCourseAttendance = async () => {
    try {
      setLoadingMark(true);
      setError('');
      
      // Get students in this course
      const stList = await apiRequest<Student[]>(`/api/admin/students?course=${encodeURIComponent(selectedCourse)}&status=active`);
      setStudents(stList);

      // Get existing attendance for this date & course
      const existing = await apiRequest<AttendanceRecord[]>(`/api/admin/attendance?course=${encodeURIComponent(selectedCourse)}&date=${attendanceDate}`);
      
      const map: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
      stList.forEach((s) => {
        const found = existing.find((e) => e.student_id === s.student_id);
        map[s.student_id] = found ? found.status : 'Present'; // default to Present
      });
      setAttendanceMap(map);
    } catch (err: any) {
      setError(err.message || 'Failed to load course attendance.');
    } finally {
      setLoadingMark(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mark') {
      loadCourseAttendance();
    }
  }, [selectedCourse, attendanceDate, activeTab]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      setError('');
      const params = new URLSearchParams();
      if (histCourse) params.append('course', histCourse);
      if (histDate) params.append('date', histDate);
      if (histStudentId) params.append('studentId', histStudentId);

      const data = await apiRequest<AttendanceRecord[]>(`/api/admin/attendance?${params.toString()}`);
      setHistoryRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [histCourse, histDate, histStudentId, activeTab]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent' | 'Leave') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    students.forEach((s) => {
      updated[s.student_id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const records = students.map((s) => ({
        studentId: s.student_id,
        status: attendanceMap[s.student_id] || 'Present',
      }));

      const res = await apiRequest('/api/admin/attendance', {
        method: 'POST',
        body: JSON.stringify({
          date: attendanceDate,
          course: selectedCourse,
          records,
        }),
      });

      setSuccess(res.message || `Attendance saved for ${records.length} students.`);
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attendance Register & Audit</h2>
              <p className="text-xs text-slate-500">Record daily classroom attendance and view permanent records</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('mark')}
              id="tab-mark-attendance"
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'mark' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              id="tab-attendance-history"
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'history' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance History
            </button>
          </div>
        </div>

        {/* Filters for Mark Attendance */}
        {activeTab === 'mark' && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course</label>
              <select
                id="attendance-course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium"
              >
                <option value="Nazra Quran">Nazra Quran</option>
                <option value="Hifzul Quran">Hifzul Quran</option>
                <option value="Gardaan">Gardaan</option>
                <option value="Tajweed">Tajweed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Date</label>
              <input
                type="date"
                id="attendance-date-input"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 outline-none font-medium"
              />
            </div>
          </div>
        )}

        {/* Filters for History */}
        {activeTab === 'history' && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Course</label>
              <select
                value={histCourse}
                onChange={(e) => setHistCourse(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="">All Courses</option>
                <option value="Nazra Quran">Nazra Quran</option>
                <option value="Hifzul Quran">Hifzul Quran</option>
                <option value="Gardaan">Gardaan</option>
                <option value="Tajweed">Tajweed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Date</label>
              <input
                type="date"
                value={histDate}
                onChange={(e) => setHistDate(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Student ID</label>
              <input
                type="text"
                placeholder="e.g. 1001"
                value={histStudentId}
                onChange={(e) => setHistStudentId(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
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

      {/* VIEW 1: MARK ATTENDANCE TABLE */}
      {activeTab === 'mark' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {selectedCourse} Enrolled Students ({students.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 mr-1">Quick Mark:</span>
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-2.5 py-1 text-[11px] font-bold bg-green-100 hover:bg-green-200 text-green-800 rounded-lg cursor-pointer"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-2.5 py-1 text-[11px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg cursor-pointer"
              >
                All Absent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-center">Status (Select)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingMark ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Loading students for {selectedCourse}...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No active students found in {selectedCourse}.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const status = attendanceMap[student.student_id] || 'Present';
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-emerald-950">
                          {student.student_id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {student.father_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {student.class_name}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.student_id, 'Present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                status === 'Present'
                                  ? 'bg-green-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.student_id, 'Absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                status === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.student_id, 'Leave')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                status === 'Leave'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Leave
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

          {students.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                id="save-attendance-btn"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>{saving ? 'Saving Attendance...' : 'Save Attendance Record'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ATTENDANCE HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingHistory ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Loading attendance history...
                    </td>
                  </tr>
                ) : historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No attendance history found matching your filters.
                    </td>
                  </tr>
                ) : (
                  historyRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {r.attendance_date}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-emerald-950">
                        {r.student_id}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {r.student_name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {r.father_name}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-800 font-medium">
                        {r.course}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {r.class_name}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : r.status === 'Absent'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
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

    </div>
  );
};
