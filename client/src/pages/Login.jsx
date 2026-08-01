import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap, AlertCircle, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, loginAsRole, error, setError } = useAuth();
  const navigate = useNavigate();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handleMockGoogleLogin = async (e) => {
    e.preventDefault();
    if (!customEmail) {
      setError("Please enter an email address to simulate Google OAuth.");
      return;
    }
    const result = await loginWithGoogle({ email: customEmail, name: customName || "Google User" });
    if (result.success) {
      redirectUser(result.user.role);
    }
  };

  const handleQuickRole = async (role) => {
    const result = await loginAsRole(role);
    if (result.success) {
      redirectUser(role);
    }
  };

  const redirectUser = (role) => {
    if (role === 'student') navigate('/student');
    else if (role === 'faculty') navigate('/faculty');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-violet-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-slate-900">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-200 to-violet-400 bg-clip-text text-transparent">
            BIT SATHY
          </h1>
          <p className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
            Bannari Amman Institute of Technology
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Smart Classroom Booking & Attendance System
          </p>
        </div>

        {/* Error Announcement */}
        {error && (
          <div className="w-full mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-xl flex items-start space-x-3 text-red-200 animate-shake">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Simulated Google OAuth Form */}
        <form onSubmit={handleMockGoogleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Google Email Address
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="user@bitsathy.ac.in"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Note: Email must end with <span className="text-slate-400">@bitsathy.ac.in</span> to pass the domain gate.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Full Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        </form>

        <div className="w-full flex items-center my-6">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="text-xs text-slate-600 px-3 uppercase tracking-widest font-semibold">
            Or Demo Switcher
          </span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Quick Role Switcher for Dev testing */}
        <div className="w-full space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 text-center uppercase tracking-wider mb-2">
            Instantly bypass and login using mock profiles:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickRole('student')}
              className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 py-2.5 px-3 rounded-lg text-center transition-all"
            >
              Student Portal
            </button>
            <button
              onClick={() => handleQuickRole('faculty')}
              className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 py-2.5 px-3 rounded-lg text-center transition-all"
            >
              Faculty Portal
            </button>
            <button
              onClick={() => handleQuickRole('staff')}
              className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 py-2.5 px-3 rounded-lg text-center transition-all"
            >
              Staff Portal
            </button>
            <button
              onClick={() => handleQuickRole('admin')}
              className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 py-2.5 px-3 rounded-lg text-center transition-all"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
