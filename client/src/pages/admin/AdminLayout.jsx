import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Shield, X } from 'lucide-react';
import { buildingsList, departmentsList, equipmentList } from '../../mock/mockRooms';
import { api } from '../../utils/api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab syncing
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'users';

  const setActiveTab = (tabId) => {
    navigate(`/admin/${tabId}`);
  };

  // State Management
  const [usersList, setUsersList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);

  // Settings
  const [allowExternalDomains, setAllowExternalDomains] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [requireSurveyForOtp, setRequireSurveyForOtp] = useState(true);

  // Health Stats
  const [serverHealth, setServerHealth] = useState('99.98%');
  const [dbStatus, setDbStatus] = useState('Healthy');

  // Modals Visibility
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // New User Form States
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserDept, setNewUserDept] = useState(departmentsList[0]);

  // New Room Form States
  const [newRoomId, setNewRoomId] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomBuilding, setNewRoomBuilding] = useState(buildingsList[0]);
  const [newRoomCapacity, setNewRoomCapacity] = useState('60');
  const [newRoomDept, setNewRoomDept] = useState(departmentsList[0]);
  const [newRoomEquip, setNewRoomEquip] = useState([]);

  // Toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const refreshData = async () => {
    try {
      const tree = await api.getUsers();
      const flat = [];
      Object.keys(tree).forEach(deptName => {
        const deptGroup = tree[deptName];
        ['students', 'faculty', 'staff', 'admin'].forEach(roleKey => {
          if (Array.isArray(deptGroup[roleKey])) {
            deptGroup[roleKey].forEach(u => {
              flat.push({
                ...u,
                id: u._id,
                rollNo: u.rollNumber || u.rollNo
              });
            });
          }
        });
      });
      setUsersList(flat);

      const roomsData = await api.getRooms();
      const mappedRooms = roomsData.map(r => ({
        ...r,
        id: r._id,
        name: r.name,
        building: r.block,
        capacity: r.capacity || 60,
        department: r.department || 'General',
        equipment: r.equipment || [],
        status: r.isAvailable ? 'Available' : 'Booked',
        bookings: (r.bookings || []).map(b => ({
          ...b,
          id: b._id,
          room: r._id,
          status: b.status === 'PENDING_STAFF_APPROVAL' ? 'Pending' : b.status === 'APPROVED' ? 'Approved' : b.status === 'REJECTED' ? 'Rejected' : b.status
        }))
      }));
      setRoomsList(mappedRooms);
    } catch (err) {
      console.error("Error refreshing admin governance data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleTogglePermission = async (userId) => {
    const userObj = usersList.find(u => u.id === userId);
    if (!userObj) return;

    try {
      await api.updateUser(userId, { suspended: !userObj.suspended });
      triggerToast("User credentials status updated.");
      refreshData();
    } catch (err) {
      triggerToast(`Error: ${err.message}`);
    }
  };

  // Add User Logic
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    if (!newUserEmail.endsWith('@bitsathy.ac.in') && !allowExternalDomains) {
      alert("Enforced Admin Rule: User email must use the official institutional domain name (@bitsathy.ac.in).");
      return;
    }

    try {
      const rollNoVal = newUserRole === 'student' ? "21CS" + Math.floor(100 + Math.random() * 800) : null;
      await api.createUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        department: newUserDept,
        rollNumber: rollNoVal,
        rollNo: rollNoVal,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserName}`,
        suspended: false
      });

      setShowAddUserModal(false);
      triggerToast(`User ${newUserName} created successfully!`);
      setNewUserName('');
      setNewUserEmail('');
      refreshData();
    } catch (err) {
      triggerToast(`Error: ${err.message}`);
    }
  };

  // Add Room Logic
  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!newRoomId || !newRoomName) return;

    try {
      await api.createRoom({
        name: newRoomName,
        block: newRoomBuilding,
        floor: 'Floor 1',
        capacity: parseInt(newRoomCapacity, 10),
        roomType: newRoomBuilding.includes('Lab') || newRoomName.toLowerCase().includes('lab') ? 'RESEARCH LAB' : 'LECTURE HALL',
        equipment: newRoomEquip,
        isAvailable: true
      });

      setShowAddRoomModal(false);
      triggerToast(`Room Specs for ${newRoomName} cataloged successfully!`);
      setNewRoomId('');
      setNewRoomName('');
      setNewRoomEquip([]);
      refreshData();
    } catch (err) {
      triggerToast(`Error: ${err.message}`);
    }
  };

  const handleEquipCheckbox = (eq) => {
    setNewRoomEquip(prev => 
      prev.includes(eq) ? prev.filter(item => item !== eq) : [...prev, eq]
    );
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Welcome Banner */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>BIT Sathy Governance Control</span>
              <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-100">
                Admin Profile
              </span>
            </h2>
            <p className="text-xs text-slate-555 text-slate-500 mt-1">
              Global system monitoring, user permission overrides, room specification updates, and security ledger downloads.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center space-x-2 max-w-sm font-bold">
            <Shield className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Academic Year: 2026-27</span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-slideIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Main Layout Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto">
        <Outlet context={{
          usersList, setUsersList,
          roomsList, setRoomsList,
          allowExternalDomains, setAllowExternalDomains,
          maintenanceMode, setMaintenanceMode,
          requireSurveyForOtp, setRequireSurveyForOtp,
          serverHealth, setServerHealth,
          dbStatus, setDbStatus,
          showAddUserModal, setShowAddUserModal,
          showAddRoomModal, setShowAddRoomModal,
          handleTogglePermission,
          triggerToast
        }} />
      </main>

      {/* Enroll Member Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddUser}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleIn text-slate-800"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Enroll Institutional Member</h3>
              <button 
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="johndoe@bitsathy.ac.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">System Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none capitalize"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff Coord</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  >
                    {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold text-slate-600 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Enroll Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddRoom}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleIn text-slate-800"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Catalog Classroom Spec</h3>
              <button 
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Room ID / Spec</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LH-105"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Room Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart Room 105"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Building Block</label>
                  <select
                    value={newRoomBuilding}
                    onChange={(e) => setNewRoomBuilding(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  >
                    {buildingsList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Min Capacity Chairs</label>
                  <input
                    type="number"
                    required
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Owning Department</label>
                <select
                  value={newRoomDept}
                  onChange={(e) => setNewRoomDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                >
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Equipment Assets</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5 max-h-24 overflow-y-auto">
                  {equipmentList.map(eq => (
                    <label key={eq} className="flex items-center space-x-1.5 text-[10px] text-slate-550 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRoomEquip.includes(eq)}
                        onChange={() => handleEquipCheckbox(eq)}
                        className="rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>{eq}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold text-slate-600 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Catalog Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
