import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { Exam } from '../../types.js';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Save, X, Clock, MapPin } from 'lucide-react';

export const AdminExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    examName: '',
    course: 'Hifzul Quran',
    examDate: new Date().toISOString().split('T')[0],
    startTime: '04:00 PM',
    endTime: '06:00 PM',
    venue: 'Main Quranic Hall',
    remarks: 'Bring personal Mushaf and pencil.',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchExams = async () => {
    try {
      setLoading(true);
      const params = courseFilter ? `?course=${encodeURIComponent(courseFilter)}` : '';
      const data = await apiRequest<Exam[]>(`/api/admin/exams${params}`);
      setExams(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [courseFilter]);

  const openCreate = () => {
    setSelectedExam(null);
    setFormData({
      examName: 'Mid-Term Evaluation',
      course: 'Hifzul Quran',
      examDate: new Date().toISOString().split('T')[0],
      startTime: '04:00 PM',
      endTime: '06:00 PM',
      venue: 'Main Quranic Hall',
      remarks: 'Oral recitation before the examination board.',
    });
    setModalMode('create');
  };

  const openEdit = (exam: Exam) => {
    setSelectedExam(exam);
    setFormData({
      examName: exam.exam_name,
      course: exam.course,
      examDate: exam.exam_date,
      startTime: exam.start_time,
      endTime: exam.end_time,
      venue: exam.venue,
      remarks: exam.remarks || '',
    });
    setModalMode('edit');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (modalMode === 'create') {
        await apiRequest('/api/admin/exams', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuccess('Exam scheduled successfully!');
      } else if (modalMode === 'edit' && selectedExam) {
        await apiRequest(`/api/admin/exams/${selectedExam.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setSuccess('Exam updated successfully!');
      }
      setModalMode(null);
      fetchExams();
    } catch (err: any) {
      setError(err.message || 'Error saving exam schedule.');
    }
  };

  const handleDelete = async (exam: Exam) => {
    if (!window.confirm(`Delete exam "${exam.exam_name}" for ${exam.course}?`)) return;
    try {
      await apiRequest(`/api/admin/exams/${exam.id}`, { method: 'DELETE' });
      setSuccess('Exam schedule deleted.');
      fetchExams();
    } catch (err: any) {
      setError(err.message || 'Failed to delete exam.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Exams Schedule & Date Sheet</h2>
              <p className="text-xs text-slate-500">Manage institutional evaluations, oral tests and date sheets</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium"
            >
              <option value="">All Courses</option>
              <option value="Nazra Quran">Nazra Quran</option>
              <option value="Hifzul Quran">Hifzul Quran</option>
              <option value="Gardaan">Gardaan</option>
              <option value="Tajweed">Tajweed</option>
            </select>

            <button
              onClick={openCreate}
              id="add-exam-btn"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam</span>
            </button>
          </div>
        </div>
      </div>

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

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center text-slate-400">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-10 text-center text-slate-500">No scheduled exams found.</div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md uppercase">
                    {exam.course}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(exam)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-3">{exam.exam_name}</h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{exam.exam_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.start_time} - {exam.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.venue}</span>
                  </div>
                </div>

                {exam.remarks && (
                  <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {exam.remarks}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                {modalMode === 'create' ? 'Schedule New Exam' : 'Edit Exam Schedule'}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                >
                  <option value="Nazra Quran">Nazra Quran</option>
                  <option value="Hifzul Quran">Hifzul Quran</option>
                  <option value="Gardaan">Gardaan</option>
                  <option value="Tajweed">Tajweed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue / Room</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions / Notes</label>
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
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Exam</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
