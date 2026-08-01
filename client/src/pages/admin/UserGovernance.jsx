import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, Plus, Search, ChevronDown, ChevronUp, 
  Edit3, Trash2, ShieldCheck, ShieldAlert, X, Info
} from 'lucide-react';
import { api } from '../../utils/api';

const UserGovernance = () => {
  const { 
    usersList, 
    setUsersList,
    setShowAddUserModal, 
    handleTogglePermission,
    triggerToast
  } = useOutletContext();

  const [userSearch, setUserSearch] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState('student'); // 'student' | 'faculty' | 'staff'
  const [openAccordions, setOpenAccordions] = useState({});
  const [editingUser, setEditingUser] = useState(null);

  // Departments List for sub-modules
  const departments = [
    "Computer Science and Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Electrical & Electronics Engineering",
    "Academic Office"
  ];

  const matchesSearch = (user) => {
    if (!userSearch) return true;
    const query = userSearch.toLowerCase();
    
    return (
      user.name?.toLowerCase().includes(query) ||
      user.rollNumber?.toLowerCase().includes(query) ||
      user.rollNo?.toLowerCase().includes(query) ||
      user.facultyId?.toLowerCase().includes(query) ||
      user.staffId?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  };

  // Get matching count for tabs
  const getRoleCount = (roleKey) => {
    return usersList.filter(u => {
      if (roleKey === 'student') return u.role === 'student';
      if (roleKey === 'faculty') return u.role === 'faculty';
      // Include admin in staff roster for governance
      return u.role === 'staff' || u.role === 'admin';
    }).length;
  };

  // Filter users by role, department & search query
  const getFilteredUsers = (roleKey, deptName) => {
    return usersList.filter(u => {
      const roleMatches = roleKey === 'student' 
        ? u.role === 'student'
        : roleKey === 'faculty'
          ? u.role === 'faculty'
          : (u.role === 'staff' || u.role === 'admin');

      const deptMatches = u.department === deptName;
      return roleMatches && deptMatches && matchesSearch(u);
    });
  };

  // Auto-expand search results
  useEffect(() => {
    if (userSearch) {
      // Find first matching user
      const firstMatch = usersList.find(matchesSearch);
      if (firstMatch) {
        // Expand role tab
        if (firstMatch.role === 'student') {
          setActiveRoleTab('student');
        } else if (firstMatch.role === 'faculty') {
          setActiveRoleTab('faculty');
        } else {
          setActiveRoleTab('staff');
        }

        // Expand matching department accordion
        const key = `${firstMatch.role === 'student' ? 'student' : firstMatch.role === 'faculty' ? 'faculty' : 'staff'}-${firstMatch.department}`;
        setOpenAccordions(prev => ({ ...prev, [key]: true }));
      }
    }
  }, [userSearch]);

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Delete user handler
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you absolutely sure you want to delete user "${userName}"? This cannot be undone.`)) {
      try {
        await api.deleteUser(userId);
        setUsersList(prev => prev.filter(u => u.id !== userId));
        if (triggerToast) triggerToast(`User ${userName} has been removed.`);
      } catch (err) {
        if (triggerToast) triggerToast(`Error: ${err.message}`);
      }
    }
  };

  // Highlight helper
  const highlightText = (text, search) => {
    if (!search || !text) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() 
            ? <mark key={i} className="bg-yellow-100 text-yellow-950 font-bold px-0.5 rounded">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  // Total count for current filtered tab
  const activeTabMatches = usersList.filter(u => {
    const roleMatches = activeRoleTab === 'student' 
      ? u.role === 'student'
      : activeRoleTab === 'faculty'
        ? u.role === 'faculty'
        : (u.role === 'staff' || u.role === 'admin');
    return roleMatches && matchesSearch(u);
  }).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4.5 h-4.5 text-blue-600" />
            <span>Official User Directory</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Configure profile mappings, assign role-based credentials, and override institutional permissions.</p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2.5 px-4 rounded-xl shadow shadow-blue-500/10 uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll Member</span>
        </button>
      </div>

      {/* Multi-Param Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Name, Roll No, Faculty ID, or Email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
        />
      </div>

      {/* Role-Based Primary Modules Tab Switcher */}
      <div className="flex border-b border-slate-105 border-slate-200 pb-px gap-2">
        <button
          onClick={() => setActiveRoleTab('student')}
          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeRoleTab === 'student'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Students ({getRoleCount('student')})
        </button>
        <button
          onClick={() => setActiveRoleTab('faculty')}
          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeRoleTab === 'faculty'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Faculty ({getRoleCount('faculty')})
        </button>
        <button
          onClick={() => setActiveRoleTab('staff')}
          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeRoleTab === 'staff'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Dept Staff ({getRoleCount('staff')})
        </button>
      </div>

      {/* Roster & Sub-modules Container */}
      <div className="space-y-4">
        {activeTabMatches === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-500">No users found matching "{userSearch}"</p>
            <p className="text-[10px] text-slate-450">Check your spelling or filter query and try again.</p>
          </div>
        ) : (
          departments.map((dept) => {
            const list = getFilteredUsers(activeRoleTab, dept);
            if (list.length === 0) return null;

            const accordionKey = `${activeRoleTab}-${dept}`;
            // Expand by default if userSearch is active, otherwise respect toggleState
            const isExpanded = userSearch ? true : !!openAccordions[accordionKey];

            return (
              <div key={dept} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                
                {/* Collapsible Accordion Header */}
                <button
                  onClick={() => toggleAccordion(accordionKey)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                    <span>{dept}</span>
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-extrabold px-2 py-0.5 rounded-full">
                      {list.length} {list.length === 1 ? 'member' : 'members'}
                    </span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {/* Collapsible Body */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100 p-2 space-y-2">
                    {list.map((u) => (
                      <div 
                        key={u.id}
                        className="p-3 hover:bg-slate-50/50 rounded-lg flex items-center justify-between flex-wrap gap-4 transition-all"
                      >
                        {/* Profile Info */}
                        <div className="flex items-center space-x-3 min-w-[250px]">
                          <img 
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} 
                            alt={u.name} 
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 shrink-0" 
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {highlightText(u.name, userSearch)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono font-semibold block mt-0.5">
                              {u.role === 'student' && <span>Roll: {highlightText(u.rollNumber || u.rollNo, userSearch)} • {u.year || '3rd Year'} | {u.semester || 'Semester 6'}</span>}
                              {u.role === 'faculty' && <span>ID: {highlightText(u.facultyId, userSearch)} • {u.designation} | Dept: {u.department}</span>}
                              {(u.role === 'staff' || u.role === 'admin') && <span>ID: {highlightText(u.staffId || u.id, userSearch)} • {u.designation || u.role} | Dept: {u.department}</span>}
                            </span>
                          </div>
                        </div>

                        {/* Email Details */}
                        <div className="text-slate-650 font-mono text-[10px] font-semibold text-right">
                          <div>{highlightText(u.email, userSearch)}</div>
                          {u.role === 'student' && (
                            <span className="block text-[8.5px] text-[#0052cc] font-sans font-extrabold uppercase mt-1">
                              {u.department}
                            </span>
                          )}
                        </div>

                        {/* Action Controls */}
                        <div className="flex items-center space-x-3">
                          {/* Permissions Override toggle */}
                          <button
                            onClick={() => handleTogglePermission(u.id)}
                            className={`text-[9px] font-black py-1.5 px-3 rounded-lg border transition-all cursor-pointer flex items-center space-x-1 uppercase ${
                              u.suspended
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {u.suspended ? (
                              <>
                                <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />
                                <span>Suspended</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>Authorized</span>
                              </>
                            )}
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-650 cursor-pointer transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Edit Profile Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn text-slate-800 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit3 className="w-4.5 h-4.5 text-blue-600" />
                  <span>Edit Profile Mapping</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Update credentials and department mapping details.
                </p>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-650 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updated = await api.updateUser(editingUser.id, editingUser);
                  setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updated } : u));
                  setEditingUser(null);
                  if (triggerToast) triggerToast(`User profile for ${editingUser.name} updated.`);
                } catch (err) {
                  if (triggerToast) triggerToast(`Error: ${err.message}`);
                }
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {editingUser.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={editingUser.rollNumber || editingUser.rollNo || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, rollNumber: e.target.value, rollNo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Academic Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 3rd Year"
                        value={editingUser.year || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, year: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Semester</label>
                    <input
                      type="text"
                      placeholder="e.g. Semester 6"
                      value={editingUser.semester || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, semester: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </>
              )}

              {editingUser.role === 'faculty' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Faculty ID</label>
                    <input
                      type="text"
                      value={editingUser.facultyId || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, facultyId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Designation</label>
                    <input
                      type="text"
                      value={editingUser.designation || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>
              )}

              {(editingUser.role === 'staff' || editingUser.role === 'admin') && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Staff ID</label>
                    <input
                      type="text"
                      value={editingUser.staffId || editingUser.id || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, staffId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Designation / Role</label>
                    <input
                      type="text"
                      value={editingUser.designation || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Department</label>
                <select
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-850 outline-none focus:border-blue-500"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserGovernance;
