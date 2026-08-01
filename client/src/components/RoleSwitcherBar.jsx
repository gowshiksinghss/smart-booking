import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Terminal, Users, User, ShieldAlert, Award } from 'lucide-react';

const RoleSwitcherBar = () => {
  const { user, loginAsRole } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSwitch = async (role) => {
    const res = await loginAsRole(role);
    if (res.success) {
      navigate(`/${role}`);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return <User className="w-3.5 h-3.5" />;
      case 'faculty': return <Award className="w-3.5 h-3.5" />;
      case 'staff': return <Users className="w-3.5 h-3.5" />;
      case 'admin': return <ShieldAlert className="w-3.5 h-3.5" />;
      default: return <Terminal className="w-3.5 h-3.5" />;
    }
  };

  const roles = [
    { key: 'student', label: 'Student' },
    { key: 'faculty', label: 'Faculty' },
    { key: 'staff', label: 'Staff' },
    { key: 'admin', label: 'Admin' }
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 select-none z-50 relative">
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-slate-300">DEMO PANEL:</span>
        <span>Active role:</span>
        <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono capitalize border border-slate-700 flex items-center space-x-1">
          {getRoleIcon(user.role)}
          <span className="ml-1">{user.role}</span>
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="mr-1">Quick Toggles:</span>
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => handleSwitch(r.key)}
            className={`px-2 py-1 rounded transition-all font-medium border cursor-pointer ${
              user.role === r.key
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSwitcherBar;
