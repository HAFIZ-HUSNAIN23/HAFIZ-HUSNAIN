import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { AdminAccount } from '../../types.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  ShieldCheck, Plus, Edit2, Trash2, CheckCircle, AlertCircle, 
  Save, X, Lock, User, KeyRound 
} from 'lucide-react';

export const AdminAccounts: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    loginId: '',
    password: '',
    status: 'active' as 'active' | 'disabled',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<AdminAccount[]>('/api/admin/accounts');
      setAdmins(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openCreate = () => {
    setSelectedAdmin(null);
    setFormData({
      name: '',
      loginId: '',
      password: '',
      status: 'active',
    });
    setModalMode('create');
  };

  const openEdit = (adm: AdminAccount) => {
    setSelectedAdmin(adm);
    setFormData({
      name: adm.name,
      loginId: adm.login_id,
      password: '',
      status: adm.status,
    });
    setModalMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (modalMode === 'create') {
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        await apiRequest('/api/admin/accounts', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuccess('New administrator account created!');
      } else if (modalMode === 'edit' && selectedAdmin) {
        await apiRequest(`/api/admin/accounts/${selectedAdmin.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setSuccess('Administrator account updated!');
      }

      setModalMode(null);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Error saving administrator account.');
    }
  };

  const toggleStatus = async (adm: AdminAccount) => {
    if (adm.id === user?.id) {
      setError('You cannot disable your own currently logged-in account.');
      return;
    }

    const newStatus = adm.status === 'active' ? 'disabled' : 'active';
    try {
      setError('');
      await apiRequest(`/api/admin/accounts/${adm.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: adm.name, status: newStatus }),
      });
      setSuccess(`Admin ${adm.name} is now ${newStatus}.`);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle admin status.');
    }
  };

  const handleDelete = async (adm: AdminAccount) => {
    if (adm.id === user?.id) {
      setError('You cannot delete your own currently logged-in account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete admin account "${adm.name}" (${adm.login_id})?`)) {
      return;
    }

    try {
      setError('');
      await apiRequest(`/api/admin/accounts/${adm.id}`, { method: 'DELETE' });
      setSuccess('Administrator account deleted.');
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to delete admin.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Administrator Accounts & Access Security</h2>
              <p className="text-xs text-slate-500">
                Manage administrative login credentials, bcrypt password hashes, and active permissions
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            id="add-admin-account-btn"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Admin Account</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Admin Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Admin Name</th>
                <th className="py-3 px-4">Login ID</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">Loading admin accounts...</td>
                </tr>
              ) : (
                admins.map((adm) => {
                  const isCurrent = adm.id === user?.id;
                  return (
                    <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {adm.name} {isCurrent && <span className="ml-2 text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">(You)</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                        {adm.login_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-800 font-semibold text-[11px]">Super Administrator</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatus(adm)}
                          disabled={isCurrent}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            adm.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {adm.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {adm.created_at?.split('T')[0] || '2026-01-01'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(adm)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(adm)}
                            disabled={isCurrent}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                            title={isCurrent ? 'Cannot delete current session' : 'Delete'}
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

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                {modalMode === 'create' ? 'Create New Admin Account' : `Edit Admin: ${selectedAdmin?.name}`}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrator Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Qari Abdul Rehman"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Login ID (Username)</label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'edit'}
                  placeholder="e.g. admin2"
                  value={formData.loginId}
                  onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {modalMode === 'create' ? 'Password *' : 'Change Password (leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  required={modalMode === 'create'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              )}

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
                  <span>{modalMode === 'create' ? 'Create Account' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
