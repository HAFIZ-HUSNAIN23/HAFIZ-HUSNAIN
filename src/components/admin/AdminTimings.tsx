import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { Timing } from '../../types.js';
import { Clock, Edit2, CheckCircle, AlertCircle, Save, X, BookOpen, MapPin } from 'lucide-react';

export const AdminTimings: React.FC = () => {
  const [timings, setTimings] = useState<Timing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTiming, setSelectedTiming] = useState<Timing | null>(null);
  const [formData, setFormData] = useState({
    course: '',
    days: '',
    startTime: '',
    endTime: '',
    room: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTimings = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Timing[]>('/api/admin/timings');
      setTimings(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch timings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimings();
  }, []);

  const openEdit = (t: Timing) => {
    setSelectedTiming(t);
    setFormData({
      course: t.course,
      days: t.days,
      startTime: t.start_time,
      endTime: t.end_time,
      room: t.room,
      notes: t.notes || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTiming) return;
    try {
      setError('');
      setSuccess('');
      await apiRequest(`/api/admin/timings/${selectedTiming.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setSuccess(`Timing updated for ${selectedTiming.course}!`);
      setSelectedTiming(null);
      fetchTimings();
    } catch (err: any) {
      setError(err.message || 'Failed to update timing.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Class Timings & Room Schedule</h2>
            <p className="text-xs text-slate-500">Configure schedule for the 4 core madrasa courses</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-10 text-center text-slate-400">Loading course timings...</div>
        ) : (
          timings.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-arabic font-bold text-sm">
                    ق
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{t.course}</h3>
                    <span className="text-[11px] text-emerald-700 font-semibold">{t.days}</span>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(t)}
                  id={`edit-timing-btn-${t.id}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Schedule</span>
                </button>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Daily Timing:</span>
                  <span className="font-bold text-slate-800">{t.start_time} - {t.end_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Classroom / Hall:</span>
                  <span className="font-semibold text-emerald-900">{t.room}</span>
                </div>
                {t.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                    {t.notes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTiming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                Edit Timing for {selectedTiming.course}
              </h3>
              <button onClick={() => setSelectedTiming(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Active Days</label>
                <input
                  type="text"
                  required
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
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
                <label className="block font-semibold text-slate-700 mb-1">Room / Location</label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTiming(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
