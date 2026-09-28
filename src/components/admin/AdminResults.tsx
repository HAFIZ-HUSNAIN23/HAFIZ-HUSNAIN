import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { Result, Student } from '../../types.js';
import { 
  Award, Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, 
  Save, X, BookOpen, GraduationCap 
} from 'lucide-react';

export const AdminResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    examName: 'Monthly Assessment 2026',
    subject: 'Tajweed & Makharij',
    examDate: new Date().toISOString().split('T')[0],
    marks: 88,
    totalMarks: 100,
    remarks: 'Excellent Tajweed and fluent recitation',
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (courseFilter) params.append('course', courseFilter);
      if (searchTerm) params.append('studentId', searchTerm);

      const data = await apiRequest<Result[]>(`/api/admin/results?${params.toString()}`);
      setResults(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    apiRequest<Student[]>('/api/admin/students')
      .then((data) => {
        setStudents(data);
        if (data.length > 0 && !formData.studentId) {
          setFormData(prev => ({ ...prev, studentId: data[0].student_id }));
        }
      })
      .catch(() => {});
  }, [courseFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const openCreateModal = () => {
    if (students.length === 0) {
      setError('No students available. Please add students in the Student Directory first.');
      return;
    }
    setSelectedResult(null);
    setFormData({
      studentId: students[0].student_id,
      examName: 'Mid-Term Evaluation',
      subject: 'Hifz Review & Tajweed',
      examDate: new Date().toISOString().split('T')[0],
      marks: 90,
      totalMarks: 100,
      remarks: 'Mashallah, very strong retention',
    });
    setModalMode('create');
  };

  const openEditModal = (res: Result) => {
    setSelectedResult(res);
    setFormData({
      studentId: res.student_id,
      examName: res.exam_name,
      subject: res.subject,
      examDate: res.exam_date,
      marks: res.marks,
      totalMarks: res.total_marks,
      remarks: res.remarks || '',
    });
    setModalMode('edit');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (modalMode === 'create') {
        await apiRequest('/api/admin/results', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuccess('Exam result created successfully!');
      } else if (modalMode === 'edit' && selectedResult) {
        await apiRequest(`/api/admin/results/${selectedResult.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setSuccess('Exam result updated successfully!');
      }

      setModalMode(null);
      fetchResults();
    } catch (err: any) {
      setError(err.message || 'Error saving exam result.');
    }
  };

  const handleDelete = async (res: Result) => {
    if (!window.confirm(`Delete result of ${res.student_name} for ${res.exam_name}?`)) {
      return;
    }

    try {
      await apiRequest(`/api/admin/results/${res.id}`, {
        method: 'DELETE',
      });
      setSuccess('Exam result deleted successfully.');
      fetchResults();
    } catch (err: any) {
      setError(err.message || 'Failed to delete result.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Exam Results & Academic Evaluations</h2>
              <p className="text-xs text-slate-500">Record, compute grades and publish official assessment scores</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            id="add-result-btn"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Result</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              id="results-search-input"
              placeholder="Search by Student ID (e.g. 1001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-none"
            />
          </form>

          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-none bg-white"
            >
              <option value="">All Courses</option>
              <option value="Nazra Quran">Nazra Quran</option>
              <option value="Hifzul Quran">Hifzul Quran</option>
              <option value="Gardaan">Gardaan</option>
              <option value="Tajweed">Tajweed</option>
            </select>
          </div>
        </div>
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Exam Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Loading exam results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No examination records found. Add student scores above.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{r.student_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {r.student_id}</span>
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-medium">
                      {r.course}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.exam_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{r.exam_date}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {r.subject}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {r.marks} <span className="text-slate-400 font-normal text-[10px]">/ {r.total_marks}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-900 text-sm">
                      {r.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        r.grade.startsWith('A')
                          ? 'bg-green-100 text-green-800'
                          : r.grade === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                      {r.remarks || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(r)}
                          id={`edit-result-btn-${r.id}`}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          id={`delete-result-btn-${r.id}`}
                          className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT RESULT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                {modalMode === 'create' ? 'Record New Exam Result' : 'Edit Exam Result'}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <select
                  required
                  id="result-student-select"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_id} - {s.name} ({s.course})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  required
                  id="result-exam-name-input"
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  id="result-subject-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    min="0"
                    required
                    id="result-marks-input"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    required
                    id="result-total-marks-input"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Remarks / Feedback</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-result-submit-btn"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Result</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
