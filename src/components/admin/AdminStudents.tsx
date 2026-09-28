import React, { useState, useEffect } from 'react';
import { Student } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { 
  Users, Search, Filter, Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, 
  Target, AlertCircle, Save, X, Phone, User, Calendar
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'target' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [targetData, setTargetData] = useState({
    targetParas: 2,
    durationDays: 15,
    startDate: new Date().toISOString().split('T')[0],
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (courseFilter) params.append('course', courseFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const data = await apiRequest<Student[]>(`/api/admin/students?${params.toString()}`);
      setStudents(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const openCreateModal = () => {
    setSelectedStudent(null);
    setFormData({
      studentId: '',
      name: '',
      fatherName: '',
      dob: '',
      gender: 'Male',
      course: 'Hifzul Quran',
      className: 'Hifz-A',
      phone: '',
      fatherPhone: '',
      address: '',
      previousEducation: '',
      admissionDate: new Date().toISOString().split('T')[0],
      monthlyFee: 2500,
      loginId: '',
      password: '',
      status: 'active',
      notes: '',
      targetParas: 2,
    });
    setModalMode('create');
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.student_id,
      name: student.name,
      fatherName: student.father_name,
      dob: student.dob || '',
      gender: student.gender || 'Male',
      course: student.course,
      className: student.class_name,
      phone: student.phone,
      fatherPhone: student.father_phone,
      address: student.address,
      previousEducation: student.previous_education || '',
      admissionDate: student.admission_date,
      monthlyFee: student.monthly_fee,
      loginId: student.login_id,
      password: '',
      status: student.status,
      notes: student.notes || '',
    });
    setModalMode('edit');
  };

  const openViewModal = (student: Student) => {
    setSelectedStudent(student);
    setModalMode('view');
  };

  const openTargetModal = (student: Student) => {
    setSelectedStudent(student);
    setTargetData({
      targetParas: student.target_paras || 2,
      durationDays: 15,
      startDate: student.target_start_date || new Date().toISOString().split('T')[0],
    });
    setModalMode('target');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        await apiRequest('/api/admin/students', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuccess('Student added successfully!');
      } else if (modalMode === 'edit' && selectedStudent) {
        await apiRequest(`/api/admin/students/${selectedStudent.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setSuccess('Student details updated successfully!');
      }
      setModalMode(null);
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Error saving student record.');
    }
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setError('');
    setSuccess('');

    try {
      await apiRequest(`/api/admin/students/${selectedStudent.student_id}/target`, {
        method: 'POST',
        body: JSON.stringify(targetData),
      });
      setSuccess(`30-day target configured for ${selectedStudent.name}!`);
      setModalMode(null);
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Error updating student target.');
    }
  };

  const toggleStatus = async (student: Student) => {
    const newStatus = student.status === 'active' ? 'disabled' : 'active';
    try {
      await apiRequest(`/api/admin/students/${student.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccess(`Student ${student.name} is now ${newStatus}.`);
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to update student status.');
    }
  };

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Are you sure you want to permanently delete student ${student.name} (${student.student_id})? All associated records will be removed.`)) {
      return;
    }

    try {
      await apiRequest(`/api/admin/students/${student.id}`, {
        method: 'DELETE',
      });
      setSuccess(`Student ${student.name} deleted successfully.`);
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Directory & Records</h2>
              <p className="text-xs text-slate-500">Manage enrollment, course assignments, targets and login access</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            id="add-new-student-btn"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              id="student-search-input"
              placeholder="Search by ID, Name or Father..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
            />
          </form>

          <div>
            <select
              id="student-course-filter"
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

          <div>
            <select
              id="student-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
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

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">30-Day Target</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
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
                    <td className="py-3 px-4">
                      <span className="font-medium text-emerald-800 block">{student.course}</span>
                      <span className="text-[10px] text-slate-400">{student.class_name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {student.phone}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openTargetModal(student)}
                        id={`set-target-btn-${student.student_id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
                        title="Configure 30-Day Target"
                      >
                        <Target className="w-3 h-3 text-amber-600" />
                        <span>{student.target_paras || 0} Paras ({student.progress_percent || 0}%)</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(student)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {student.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewModal(student)}
                          id={`view-student-${student.student_id}`}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          id={`edit-student-${student.student_id}`}
                          className="p-1.5 text-slate-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          id={`delete-student-${student.student_id}`}
                          className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Student"
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

      {/* CREATE / EDIT MODAL */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                {modalMode === 'create' ? 'Add New Madrasa Student' : `Edit Student #${selectedStudent?.student_id}`}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="modal-student-id"
                    disabled={modalMode === 'edit'}
                    placeholder="e.g. 1004"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="modal-student-name"
                    placeholder="e.g. Abdullah Khan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Father Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="modal-father-name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    id="modal-dob"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course <span className="text-red-500">*</span></label>
                  <select
                    id="modal-course"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white"
                  >
                    <option value="Nazra Quran">Nazra Quran</option>
                    <option value="Hifzul Quran">Hifzul Quran</option>
                    <option value="Gardaan">Gardaan</option>
                    <option value="Tajweed">Tajweed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Section</label>
                  <input
                    type="text"
                    id="modal-class"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    id="modal-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father Phone</label>
                  <input
                    type="tel"
                    id="modal-father-phone"
                    value={formData.fatherPhone}
                    onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    id="modal-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Fee (PKR)</label>
                  <input
                    type="number"
                    id="modal-monthly-fee"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    id="modal-admission-date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Portal Login ID</label>
                  <input
                    type="text"
                    id="modal-login-id"
                    placeholder="Defaults to Student ID"
                    value={formData.loginId}
                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {modalMode === 'create' ? 'Portal Password *' : 'Change Password (optional)'}
                  </label>
                  <input
                    type="password"
                    id="modal-password"
                    required={modalMode === 'create'}
                    placeholder={modalMode === 'edit' ? 'Leave blank to retain current' : 'Min 6 chars'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                {modalMode === 'create' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Initial 30-Day Target (Paras)</label>
                    <input
                      type="number"
                      id="modal-target-paras"
                      step="0.25"
                      min="0.25"
                      max="30"
                      value={formData.targetParas}
                      onChange={(e) => setFormData({ ...formData, targetParas: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="modal-submit-student-btn"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{modalMode === 'create' ? 'Save Student' : 'Update Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 30-DAY TARGET SETUP MODAL */}
      {modalMode === 'target' && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold font-serif-title">
                  Configure 30-Day Target
                </h3>
              </div>
              <button onClick={() => setModalMode(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTargetSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-950 block text-sm">{selectedStudent.name}</span>
                <span className="text-slate-600">ID: {selectedStudent.student_id} • Course: {selectedStudent.course}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Quranic Paras for 30 Days (مقدار پارہ جات) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="30"
                  required
                  id="target-paras-input"
                  value={targetData.targetParas}
                  onChange={(e) => setTargetData({ ...targetData, targetParas: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-sm font-bold text-emerald-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Each student has an independent target (e.g. 2 Paras, 5 Paras, 10 Paras).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Start Date
                </label>
                <input
                  type="date"
                  required
                  id="target-start-date-input"
                  value={targetData.startDate}
                  onChange={(e) => setTargetData({ ...targetData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  End Date will automatically be calculated as 30 calendar days from start date.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-target-btn"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                >
                  Save 30-Day Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT DETAILS MODAL */}
      {modalMode === 'view' && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-title">
                Student Profile: {selectedStudent.name}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student ID</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStudent.student_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Full Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Father Name</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.father_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Course & Class</span>
                  <span className="font-semibold text-emerald-800">{selectedStudent.course} ({selectedStudent.class_name})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone Number</span>
                  <span className="font-mono text-slate-700">{selectedStudent.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Father Phone</span>
                  <span className="font-mono text-slate-700">{selectedStudent.father_phone || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Address</span>
                  <span className="text-slate-700">{selectedStudent.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Admission Date</span>
                  <span className="text-slate-700">{selectedStudent.admission_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Tuition Fee</span>
                  <span className="font-bold text-emerald-900">PKR {selectedStudent.monthly_fee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Portal Login ID</span>
                  <span className="font-mono text-slate-700">{selectedStudent.login_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Account Status</span>
                  <span className={`font-bold uppercase ${selectedStudent.status === 'active' ? 'text-green-700' : 'text-rose-700'}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              {selectedStudent.notes && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Administrative Remarks:</span>
                  <p className="text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    {selectedStudent.notes}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
