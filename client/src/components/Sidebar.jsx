import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, CheckSquare, PlusCircle, Radio, Megaphone, 
  ListTodo, Calendar, BarChart2, Shield, Users, Database, FileOutput
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { user } = useAuth();

  if (!user) return null;

  const getLinks = (role) => {
    switch (role) {
      case 'student':
        return [
          { id: 'search', label: 'Search & Book', icon: <Search className="w-4 h-4" /> },
          { id: 'bookings', label: 'My Bookings', icon: <Calendar className="w-4 h-4" /> },
          { id: 'attendance', label: 'Attendance Check-in', icon: <CheckSquare className="w-4 h-4" /> }
        ];
      case 'faculty':
        return [
          { id: 'request', label: 'Initiative Creator', icon: <PlusCircle className="w-4 h-4" /> },
          { id: 'session', label: 'Live Session Control', icon: <Radio className="w-4 h-4" /> },
          { id: 'broadcast', label: 'Broadcast Center', icon: <Megaphone className="w-4 h-4" /> }
        ];
      case 'staff':
        return [
          { id: 'approvals', label: 'Initiative Approvals', icon: <ListTodo className="w-4 h-4" /> },
          { id: 'matrix', label: 'Room Grid Matrix', icon: <Calendar className="w-4 h-4" /> },
          { id: 'reports', label: 'Usage Analytics', icon: <BarChart2 className="w-4 h-4" /> }
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'System Overview', icon: <Shield className="w-4 h-4" /> },
          { id: 'users', label: 'User Governance', icon: <Users className="w-4 h-4" /> },
          { id: 'rooms', label: 'Room Specs Inventory', icon: <Database className="w-4 h-4" /> },
          { id: 'export', label: 'Data Export Engine', icon: <FileOutput className="w-4 h-4" /> }
        ];
      default:
        return [];
    }
  };

  const navLinks = getLinks(user.role);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed md:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-slate-900/60 backdrop-blur border-r border-slate-800/80 p-4 z-40 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full justify-between pb-6">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">
                {user.role} Dashboard
              </p>
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer
                      ${activeTab === link.id
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                      }
                    `}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile footer inside Sidebar */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-2.5">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-7 h-7 rounded-full bg-slate-800"
            />
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-[9px] text-slate-500 truncate">{user.designation || user.rollNo || "Member"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
