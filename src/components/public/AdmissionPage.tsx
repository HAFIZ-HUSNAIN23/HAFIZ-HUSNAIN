import React, { useState } from 'react';
import { apiRequest } from '../../api/client.js';
import { Send, CheckCircle, AlertCircle, Phone, Calendar, User, MapPin, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';

interface Props {
  initialCourse?: string;
  onNavigateHome?: () => void;
}

export const AdmissionPage: React.FC<Props> = ({ initialCourse, onNavigateHome }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    course: initialCourse || 'Hifzul Quran',
    className: 'Hifz-A',
    phone: '',
    fatherPhone: '',
    address: '',
    previousEducation: '',
    admissionDate: new Date().toISOString().split('T')[0],
    monthlyFee: '2500',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{
    applicationNo: string;
    message: string;
    whatsappUrl: string;
    whatsappMessage: string;
  } | null>(null);

  const courseClasses: Record<string, string[]> = {
    'Hifzul Quran': ['Hifz-A', 'Hifz-B', 'Hifz-Advanced'],
    'Nazra Quran': ['Nazra-A', 'Nazra-B', 'Qaida-Junior'],
    'Gardaan': ['Gardaan-A', 'Gardaan-B'],
    'Tajweed': ['Tajweed-A', 'Tajweed-Advanced'],
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    const classes = courseClasses[selected] || ['General'];
    setFormData((prev) => ({
      ...prev,
      course: selected,
      className: classes[0],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.studentName.trim()) {
      setErrorMsg('Student Name is required.');
      return;
    }
    if (!formData.fatherName.trim()) {
      setErrorMsg('Father / Guardian Name is required.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMsg('Please enter a valid phone number (at least 10 digits).');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Address is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiRequest('/api/public/admission', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setSuccessData({
        applicationNo: res.applicationNo,
        message: res.message,
        whatsappUrl: res.whatsappUrl,
        whatsappMessage: res.whatsappMessage,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit admission form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-200">
            Admissions Open
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-title text-emerald-950 mt-3 mb-3">
            Online Admission Form
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Begin the blessed journey of Quranic learning at Madrassa Arabiyyah Misbah Ul Quran For Huffaz. Please provide accurate information for institutional records.
          </p>
        </div>

        {/* Success Modal / View */}
        {successData ? (
          <div className="bg-white rounded-2xl border border-emerald-300 shadow-xl p-8 sm:p-10 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Application Submitted
            </span>

            <h3 className="text-2xl font-bold text-emerald-950 font-serif-title mt-3">
              Application #{successData.applicationNo}
            </h3>

            <p className="text-slate-600 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
              {successData.message}
            </p>

            {/* WhatsApp Integration Box */}
            <div className="mt-8 bg-emerald-50/80 rounded-2xl p-6 border border-emerald-200 text-left max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">Direct WhatsApp Notification</h4>
                  <p className="text-xs text-slate-600">Notify the administration instantly via WhatsApp</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs text-slate-700 whitespace-pre-wrap font-mono mb-4 max-h-36 overflow-y-auto">
                {successData.whatsappMessage}
              </div>

              <a
                href={successData.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                id="send-whatsapp-admission-btn"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Send WhatsApp Notification Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setFormData({
                    studentName: '',
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
                    monthlyFee: '2500',
                    notes: '',
                  });
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Submit Another Application
              </button>
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Return to Home
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="bg-white rounded-2xl border border-emerald-900/15 shadow-xl p-6 sm:p-10">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Section 1: Student Information */}
              <div>
                <h3 className="text-base font-bold text-emerald-950 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Student & Parent Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-student-name"
                      required
                      placeholder="e.g. Muhammad Ahmad"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Father / Guardian Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-father-name"
                      required
                      placeholder="e.g. Muhammad Tariq"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="input-dob"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="input-gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all bg-white"
                    >
                      <option value="Male">Male (طالب علم)</option>
                      <option value="Female">Female (طالبہ)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Course & Academic Details */}
              <div>
                <h3 className="text-base font-bold text-emerald-950 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Course & Enrollment Preferences</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="input-course"
                      value={formData.course}
                      onChange={handleCourseChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all bg-white font-medium"
                    >
                      <option value="Nazra Quran">1. Nazra Quran</option>
                      <option value="Hifzul Quran">2. Hifzul Quran</option>
                      <option value="Gardaan">3. Gardaan</option>
                      <option value="Tajweed">4. Tajweed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Class
                    </label>
                    <select
                      id="input-class"
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all bg-white"
                    >
                      {(courseClasses[formData.course] || ['General']).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Previous Education / Quranic Background
                    </label>
                    <input
                      type="text"
                      id="input-prev-edu"
                      placeholder="e.g. Completed Noorani Qaida, 5th Grade"
                      value={formData.previousEducation}
                      onChange={(e) => setFormData({ ...formData, previousEducation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      id="input-admission-date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monthly Fee (PKR)
                    </label>
                    <input
                      type="number"
                      id="input-monthly-fee"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Address */}
              <div>
                <h3 className="text-base font-bold text-emerald-950 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Contact & Residence</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student / Primary Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="input-student-phone"
                      required
                      placeholder="e.g. 03224616821"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Father / Guardian Phone
                    </label>
                    <input
                      type="tel"
                      id="input-father-phone"
                      placeholder="e.g. 03314925285"
                      value={formData.fatherPhone}
                      onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-address"
                      required
                      placeholder="e.g. Kot Lakhpat, Karmanwala Bazar, Lahore"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Special Notes / Remarks
                    </label>
                    <textarea
                      id="input-notes"
                      rows={2}
                      placeholder="Any health conditions, preferred timing slot, or special educational requests..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  * By submitting, you agree to adhere to all madrasa discipline and Tajweed rules.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-admission-form-btn"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
