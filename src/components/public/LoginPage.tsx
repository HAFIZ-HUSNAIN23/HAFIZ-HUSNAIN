import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { ShieldCheck, UserCheck, Lock, User, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

interface Props {
  initialRole?: 'admin' | 'student';
  onLoginSuccess: (role: 'admin' | 'student') => void;
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<Props> = ({
  initialRole = 'admin',
  onLoginSuccess,
  onNavigateHome,
  onNavigate,
}) => {
  const [role, setRole] = useState<'admin' | 'student'>(initialRole);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleRoleSwitch = (newRole: 'admin' | 'student') => {
    setRole(newRole);
    setErrorMsg('');
    if (newRole === 'admin') {
      setLoginId('admin');
      setPassword('POQ@2026');
    } else {
      setLoginId('');
      setPassword('');
    }
  };

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginId.trim() || !password) {
      setErrorMsg('Please enter your Login ID and Password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(role, loginId.trim(), password);
      onLoginSuccess(user.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Login ID or Password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Card Header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 border-2 border-amber-400/40 items-center justify-center shadow-lg mb-3">
            <span className="font-arabic text-amber-300 text-3xl font-bold">ق</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-emerald-950">
            Madrassa Arabiyyah Misbah Ul Quran For Huffaz
          </h2>
          <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-semibold">
            Institutional Portal Authentication
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-900/10 p-6 sm:p-8">
          
          {/* Role Selection Tabs (ADMIN vs STUDENT only - NO TEACHER) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              id="role-tab-admin"
              onClick={() => handleRoleSwitch('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>ADMIN LOGIN</span>
            </button>

            <button
              type="button"
              id="role-tab-student"
              onClick={() => handleRoleSwitch('student')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>STUDENT LOGIN</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {role === 'admin' ? 'Admin Login ID / Username' : 'Student ID / Login ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  id="login-input-id"
                  placeholder={role === 'admin' ? 'admin' : '1001'}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  id="login-input-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="login-submit-btn"
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Student'}`}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </form>

          {/* Credentials Helper Box */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-[11px] text-slate-700 space-y-1.5">
              <span className="font-bold text-emerald-950 block">Portal Access Information:</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Admin Account:</span>
                <button
                  type="button"
                  onClick={() => {
                    setRole('admin');
                    setLoginId('admin');
                    setPassword('POQ@2026');
                  }}
                  className="text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  admin / POQ@2026
                </button>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60 leading-tight">
                Student accounts are created directly by the Admin in the Student Directory. Students sign in with their assigned Login ID & password.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              id="return-home-btn"
              onClick={handleHomeClick}
              className="text-xs text-slate-500 hover:text-emerald-800 font-medium cursor-pointer"
            >
              ← Return to Public Homepage
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
