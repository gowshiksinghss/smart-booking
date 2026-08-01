import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, BookOpen, ChevronDown 
} from 'lucide-react';
import { mockNotifications } from '../mock/mockBookings';

const getDeptAbbreviation = (dept) => {
  if (!dept) return '';
  if (dept.toLowerCase().includes('computer science')) return 'CSE';
  if (dept.toLowerCase().includes('information')) return 'IT';
  if (dept.toLowerCase().includes('mechanical')) return 'ME';
  if (dept.toLowerCase().includes('electrical')) return 'EEE';
  return dept;
};

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.role-switcher-container')) {
        setShowRoleSwitcher(false);
      }
      if (!event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.profile-card-container')) {
        setShowProfileCard(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // Filter notifications relevant to user's role or department
  const userNotifications = mockNotifications.filter(n => {
    if (n.targetType === 'Department' && n.targetValue === user.department) return true;
    if (n.targetType === 'RollNumbers' && user.rollNo && n.targetValue.includes(user.rollNo)) return true;
    return false;
  });

  const handleRoleSwitch = (role) => {
    const res = loginAsRole(role);
    if (res.success) {
      setShowRoleSwitcher(false);
      setShowProfileCard(false);
      navigate(`/${role}`);
    }
  };

  // Main Nav Tab Links based on Role
  const getNavTabs = (role) => {
    switch (role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'find', label: 'Find Rooms' },
          { id: 'bookings', label: 'Bookings' },
          { id: 'attendance', label: 'Attendance' }
        ];
      case 'faculty':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'request', label: 'Booking' },
          { id: 'broadcast', label: 'Broadcasts' },
          { id: 'session', label: 'OTP' }
        ];
      case 'staff':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'approvals', label: 'Approval' },
          { id: 'matrix', label: 'Rooms' },
          { id: 'announcements', label: 'Notify' },
          { id: 'otp', label: 'OTP' }
        ];
      case 'admin':
        return [
          { id: 'users', label: 'Users' },
          { id: 'rooms', label: 'Rooms' },
          { id: 'export', label: 'Analytics' },
          { id: 'settings', label: 'Settings' }
        ];
      default:
        return [];
    }
  };

  const tabs = getNavTabs(user.role);

  const renderQuickTools = (isMobile = false) => {
    return (
      <div className={`flex items-center space-x-2 md:space-x-4 ${isMobile ? 'scale-90 md:scale-100 origin-right' : ''}`}>
        
        {/* Role Switcher Dropdown */}
        <div className="relative role-switcher-container">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-bold text-slate-650 px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer select-none"
          >
            <span className="capitalize">{user.role} Mode</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-450" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn text-xs font-bold text-slate-600">
              <div className="px-3 py-1 border-b border-slate-100 text-[9px] text-slate-400 uppercase tracking-widest">
                Switch Role Mode
              </div>
              {['student', 'faculty', 'staff', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 capitalize flex items-center justify-between cursor-pointer ${
                    user.role === role ? 'text-[#0052cc] bg-blue-50/40' : ''
                  }`}
                >
                  <span>{role}</span>
                  {user.role === role && <span className="w-1.5 h-1.5 rounded-full bg-[#0052cc]"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Trigger */}
        <div className="relative notifications-container">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-400 hover:text-slate-650 focus:outline-none relative p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {userNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alerts Board</span>
                <span className="text-[10px] bg-blue-100 text-[#0052cc] px-2 py-0.5 rounded font-extrabold">
                  {userNotifications.length} New
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                    No new announcements.
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-all text-left">
                      <p className="text-xs font-bold text-slate-885 text-slate-900">{notif.title}</p>
                      <p className="text-[10px] text-slate-550 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-[8px] text-slate-400 mt-2 flex justify-between">
                        <span>Sender: {notif.sender}</span>
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-3 border-l border-[#e2e8f0] relative profile-card-container">
          <div 
            onClick={() => setShowProfileCard(!showProfileCard)}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-85 select-none"
          >
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 border border-slate-200"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
              <p className="text-[9px] text-[#0052cc] font-bold mt-0.5 uppercase tracking-wide">
                {user.role === 'student'
                  ? `${user.rollNumber || user.rollNo || ''} • ${getDeptAbbreviation(user.department)} | Year ${user.year?.match(/\d+/)?.[0] || '3'} • Sem ${user.semester?.match(/\d+/)?.[0] || '6'}`
                  : `${getDeptAbbreviation(user.department)} | ${user.designation || 'Faculty'}`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-slate-455 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* User Information Popup Card */}
          {showProfileCard && (
            <div className="absolute right-0 top-full mt-2 w-68 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 z-50 animate-fadeIn text-left text-slate-800">
              <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full border-2 border-blue-500/20 bg-slate-50"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{user.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {user.designation || (user.role === 'student' ? 'Student' : user.role === 'faculty' ? 'Faculty' : user.role === 'staff' ? 'Staff' : 'Administrator')}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="font-bold text-slate-400">Full Name</span>
                  <span className="font-extrabold text-slate-700">{user.name}</span>
                </div>

                {user.role === 'student' ? (
                  <>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="font-bold text-slate-400">Roll Number</span>
                      <span className="font-extrabold text-slate-700">{user.rollNumber || user.rollNo}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="font-bold text-slate-400">Department</span>
                      <span className="font-extrabold text-slate-750 text-right text-slate-700">{user.department}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="font-bold text-slate-400">Academic Year</span>
                      <span className="font-extrabold text-slate-700">{user.year || '3rd Year'}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="font-bold text-slate-400">Current Semester</span>
                      <span className="font-extrabold text-slate-700">{user.semester || 'Semester 6'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="font-bold text-slate-400">Employee ID</span>
                      <span className="font-extrabold text-slate-700">
                        {user.facultyId || user.staffId || (user.role === 'admin' ? 'ADM-94002' : 'EMP-58301')}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="font-bold text-slate-400">Department</span>
                      <span className="font-extrabold text-slate-750 text-right text-slate-700">{user.department}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="font-bold text-slate-400">Designation</span>
                      <span className="font-extrabold text-slate-700">{user.designation || (user.role === 'admin' ? 'Academic Administrator' : 'Staff')}</span>
                    </div>
                  </>
                )}

                <div className="flex flex-col space-y-0.5 pt-1.5">
                  <span className="font-bold text-slate-400">Email Address</span>
                  <span className="font-semibold text-slate-700 break-all select-all">{user.email}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-1">
                <button
                  onClick={logout}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase py-2.5 rounded-xl cursor-pointer transition-all text-center tracking-wider"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-40 shadow-sm select-none gap-4">
      
      {/* Top Row container (holds branding and mobile quick tools) */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        {/* Left: Branding & Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0052cc] to-[#0747a6] flex items-center justify-center shadow-md shadow-blue-500/10">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
              BIT Sathy
            </h1>
            <p className="text-[9px] text-[#0052cc] tracking-wider uppercase font-bold mt-0.5">
              Smart Classroom Portal
            </p>
          </div>
        </div>

        {/* Quick Tools on Mobile Screen */}
        <div className="flex md:hidden">
          {renderQuickTools(true)}
        </div>
      </div>

      {/* Center: Dynamic Navigation Tab Links */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-500 overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-[#0052cc] shadow-sm'
                : 'hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right: Quick Tools on Desktop Screen */}
      <div className="hidden md:flex">
        {renderQuickTools(false)}
      </div>

    </nav>
  );
};

export default Navbar;
