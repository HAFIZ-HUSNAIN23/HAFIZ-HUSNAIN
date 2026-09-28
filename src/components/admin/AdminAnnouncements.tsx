import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { Announcement } from '../../types.js';
import { Bell, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Save, X, Eye } from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Published' as 'Published' | 'Draft',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Announcement[]>('/api/admin/announcements');
      setAnnouncements(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreate = () => {
    setSelectedAnn(null);
    setFormData({
      title: '',
      message: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Published',
    });
    setModalMode('create');
  };

  const openEdit = (ann: Announcement) => {
    setSelectedAnn(ann);
    setFormData({
      title: ann.title,
      message: ann.message,
      date: ann.date,
      status: ann.status,
    });
    setModalMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (modalMode === 'create') {
        await apiRequest('/api/admin/announcements', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuccess('Announcement published successfully!');
      } else if (modalMode === 'edit' && selectedAnn) {
        await apiRequest(`/api/admin/announcements/${selectedAnn.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setSuccess('Announcement updated!');
      }
      setModalMode(null);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Failed to save announcement.');
    }
  };

  const handleDelete = async (ann: Announcement) => {
    if (!window.confirm(`Delete announcement "${ann.title}"?`)) return;
    try {
      await apiRequest(`/api/admin/announcements/${ann.id}`, { method: 'DELETE' });
      setSuccess('Announcement deleted.');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Institutional Circulars & Announcements</h2>
              <p className="text-xs text-slate-500">Publish notices visible to students and madrasa visitors</p>
            </div>
          </div>

          <button
            onClick={openCreate}
            id="add-announcement-btn"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
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

      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="py-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No announcements created yet. Click "New Announcement" to publish circulars.
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ann.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ann.status}
                  </span>
                  <span className="text-xs text-slate-400">{ann.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(ann)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-2">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
            </div>
          ))
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                {modalMode === 'create' ? 'Create Announcement' : 'Edit Announcement'}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramadan Mubarak & Exam Schedule"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Circular Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Details of the announcement..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
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
                  <span>Save Announcement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
