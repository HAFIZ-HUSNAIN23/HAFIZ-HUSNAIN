import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.js';
import { FeeChallan, Student } from '../../types.js';
import { ChallanPrintModal } from '../common/ChallanPrintModal.js';
import { 
  CreditCard, Printer, Search, Plus, CheckCircle, AlertCircle, 
  Calendar, FileText, Download, User, DollarSign, Filter
} from 'lucide-react';

export const AdminFeeChallans: React.FC = () => {
  const [challans, setChallans] = useState<FeeChallan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generation Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTarget, setGenTarget] = useState<'all' | 'single'>('all');
  const [genStudentId, setGenStudentId] = useState('');
  const [genMonth, setGenMonth] = useState('October');
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genIssueDate, setGenIssueDate] = useState(`${new Date().getFullYear()}-10-01`);
  const [genDueDate, setGenDueDate] = useState(`${new Date().getFullYear()}-10-10`);
  const [genExpiryDate, setGenExpiryDate] = useState(`${new Date().getFullYear()}-10-10`);
  const [genFeeAmount, setGenFeeAmount] = useState<number>(2500);
  const [generating, setGenerating] = useState(false);

  // Print Preview Modal
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('studentId', searchTerm);

      const data = await apiRequest<FeeChallan[]>(`/api/admin/challans?${params.toString()}`);
      setChallans(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fee challans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
    // Load students for single selection
    apiRequest<Student[]>('/api/admin/students')
      .then((data) => {
        setStudents(data);
        if (data.length > 0) setGenStudentId(data[0].student_id);
      })
      .catch(() => {});
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChallans();
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError('');
      setSuccess('');

      const res = await apiRequest('/api/admin/challans/generate', {
        method: 'POST',
        body: JSON.stringify({
          target: genTarget,
          studentId: genTarget === 'single' ? genStudentId : undefined,
          month: genMonth,
          year: Number(genYear),
          issueDate: genIssueDate,
          dueDate: genDueDate,
          expiryDate: genExpiryDate,
          feeAmount: genTarget === 'single' ? Number(genFeeAmount) : undefined,
        }),
      });

      setSuccess(res.message || 'Fee challans generated successfully!');
      setShowGenModal(false);
      fetchChallans();
    } catch (err: any) {
      setError(err.message || 'Failed to generate challans.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusUpdate = async (challan: FeeChallan, newStatus: 'Paid' | 'Unpaid' | 'Overdue') => {
    try {
      await apiRequest(`/api/admin/challans/${challan.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccess(`Challan ${challan.challan_no} marked as ${newStatus}.`);
      fetchChallans();
    } catch (err: any) {
      setError(err.message || 'Failed to update challan status.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Official Fee Challan Management</h2>
              <p className="text-xs text-slate-500">
                Generate 3-copy printable challans (Bank Copy, Office Copy, Student Copy) issued on 1st, due on 10th
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGenModal(true)}
            id="generate-challans-btn"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Challans</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              id="challan-search-input"
              placeholder="Search by Student ID (e.g. 1001) or Challan No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-none"
            />
          </form>

          <div>
            <select
              id="challan-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-none bg-white"
            >
              <option value="">All Challan Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
              <option value="Overdue">Overdue Only</option>
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

      {/* Challans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Challan No</th>
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4">Month / Year</th>
                <th className="py-3 px-4">Fee Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">3-Copy Print / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Loading challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No fee challans found matching criteria. Click "Generate New Challans" to issue.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-950 font-mono">
                      {ch.challan_no}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{ch.student_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {ch.student_id} • s/o {ch.father_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-emerald-800">{ch.course}</span>
                      <span className="text-[10px] text-slate-400 block">{ch.class_name}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {ch.month} {ch.year}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-900">
                      PKR {ch.fee_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-red-700 font-medium">
                      {ch.due_date}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ch.status}
                        onChange={(e) => handleStatusUpdate(ch, e.target.value as any)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer outline-none ${
                          ch.status === 'Paid'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : ch.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedChallan(ch)}
                        id={`print-challan-btn-${ch.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-lg shadow-xs text-xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>3-Copy Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE CHALLANS MODAL */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                Generate Monthly Fee Challans
              </h3>
              <button onClick={() => setShowGenModal(false)} className="text-emerald-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Students</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenTarget('all')}
                    className={`py-2 text-center rounded-xl font-bold border transition-colors ${
                      genTarget === 'all'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    All Active Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenTarget('single')}
                    className={`py-2 text-center rounded-xl font-bold border transition-colors ${
                      genTarget === 'single'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Single Specific Student
                  </button>
                </div>
              </div>

              {genTarget === 'single' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                  <select
                    id="gen-student-select"
                    value={genStudentId}
                    onChange={(e) => {
                      setGenStudentId(e.target.value);
                      const st = students.find(s => s.student_id === e.target.value);
                      if (st) setGenFeeAmount(st.monthly_fee);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                  >
                    {students.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.student_id} - {s.name} ({s.course})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Month</label>
                  <select
                    value={genMonth}
                    onChange={(e) => setGenMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={genYear}
                    onChange={(e) => setGenYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date (1st)</label>
                  <input
                    type="date"
                    required
                    value={genIssueDate}
                    onChange={(e) => setGenIssueDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date (10th)</label>
                  <input
                    type="date"
                    required
                    value={genDueDate}
                    onChange={(e) => setGenDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date (10th)</label>
                  <input
                    type="date"
                    required
                    value={genExpiryDate}
                    onChange={(e) => setGenExpiryDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 outline-none text-[11px]"
                  />
                </div>
              </div>

              {genTarget === 'single' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fee Amount (PKR)</label>
                  <input
                    type="number"
                    value={genFeeAmount}
                    onChange={(e) => setGenFeeAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-emerald-900"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  id="confirm-generate-challans-btn"
                  className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <span>{generating ? 'Issuing...' : 'Generate Challans'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3-Copy Print Preview Modal */}
      {selectedChallan && (
        <ChallanPrintModal
          challan={selectedChallan}
          onClose={() => setSelectedChallan(null)}
        />
      )}

    </div>
  );
};
