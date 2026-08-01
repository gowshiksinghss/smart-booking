import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';

const RoomsInventory = ({ roomsList, setRoomsList, triggerToast }) => {
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Form states
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomBuilding, setRoomBuilding] = useState('SF Block');
  const [roomCapacity, setRoomCapacity] = useState('60');
  const [roomDept, setRoomDept] = useState('Computer Science and Engineering');
  const [roomEquip, setRoomEquip] = useState([]);

  const buildings = ["SF Block", "IB Block", "Mechanical Block", "Auditorium Block"];
  const departments = [
    "Computer Science and Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Electrical & Electronics Engineering"
  ];
  const equipmentOptions = ["Projector", "Hi-Speed Wi-Fi", "Audio System", "AC", "Smart Board"];

  const handleEquipToggle = (eq) => {
    setRoomEquip(prev => 
      prev.includes(eq) ? prev.filter(item => item !== eq) : [...prev, eq]
    );
  };

  const resetForm = () => {
    setRoomId('');
    setRoomName('');
    setRoomBuilding('SF Block');
    setRoomCapacity('60');
    setRoomDept('Computer Science and Engineering');
    setRoomEquip([]);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!roomId || !roomName) return;

    if (roomsList.some(r => r.id.toLowerCase() === roomId.toLowerCase())) {
      alert("Room ID already exists.");
      return;
    }

    const newRoom = {
      id: roomId.toUpperCase(),
      name: roomName,
      building: roomBuilding,
      capacity: parseInt(roomCapacity, 10),
      department: roomDept,
      equipment: roomEquip,
      status: "Available",
      bookings: []
    };

    setRoomsList([...roomsList, newRoom]);
    setShowAddModal(false);
    resetForm();
    if (triggerToast) triggerToast(`Room ${newRoom.id} added successfully.`);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setRoomId(room.id);
    setRoomName(room.name);
    setRoomBuilding(room.building);
    setRoomCapacity(String(room.capacity));
    setRoomDept(room.department);
    setRoomEquip(room.equipment || []);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!roomName) return;

    setRoomsList(prev => prev.map(r => {
      if (r.id === editingRoom.id) {
        return {
          ...r,
          name: roomName,
          building: roomBuilding,
          capacity: parseInt(roomCapacity, 10),
          department: roomDept,
          equipment: roomEquip
        };
      }
      return r;
    }));

    setEditingRoom(null);
    resetForm();
    if (triggerToast) triggerToast(`Room specifications updated.`);
  };

  const handleToggleMaintenance = (room) => {
    const nextStatus = room.status === 'Maintenance' ? 'Available' : 'Maintenance';
    setRoomsList(prev => prev.map(r => {
      if (r.id === room.id) {
        return { ...r, status: nextStatus };
      }
      return r;
    }));
    if (triggerToast) triggerToast(`Room ${room.id} is now ${nextStatus.toLowerCase()}.`);
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm(`Are you sure you want to delete room ${id}?`)) {
      setRoomsList(prev => prev.filter(r => r.id !== id));
      if (triggerToast) triggerToast(`Room ${id} deleted.`);
    }
  };

  // Filter logic
  const filteredRooms = roomsList.filter(room => {
    const matchesBlock = blockFilter === 'All Blocks' || room.building === blockFilter;
    const matchesDept = deptFilter === 'All Departments' || room.department === deptFilter;
    return matchesBlock && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-left text-slate-800">
      
      {/* Controls & Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Campus Block</label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
            >
              <option value="All Blocks">All Blocks</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
            >
              <option value="All Departments">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2.5 px-4 rounded-xl shadow shadow-blue-500/10 uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Catalog Room</span>
        </button>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <div 
            key={room.id} 
            className={`bg-white border p-5 rounded-2xl flex flex-col justify-between hover:border-slate-350 transition-all shadow-sm ${
              room.status === 'Maintenance' ? 'border-amber-200 bg-amber-50/5' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                    <span>{room.name}</span>
                    {room.status === 'Maintenance' && (
                      <span className="text-[8px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded uppercase font-black tracking-wider flex items-center space-x-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Maint</span>
                      </span>
                    )}
                  </h4>
                  <span className="text-[9px] font-mono text-[#0052cc] font-extrabold mt-1 block">ID: {room.id}</span>
                </div>
                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-650 font-extrabold px-2 py-0.5 rounded">
                  {room.building}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-[10px] text-slate-505 text-slate-500 border-t border-slate-100 pt-3 font-semibold">
                <p>Dept: <span className="font-bold text-slate-700">{room.department}</span></p>
                <p>Capacity: <span className="font-bold text-slate-700">{room.capacity} Chairs</span></p>
                
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {room.equipment?.map(eq => (
                    <span key={eq} className="bg-slate-50 text-slate-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
              {/* Maintenance Toggle */}
              <button
                onClick={() => handleToggleMaintenance(room)}
                className={`text-[9px] font-black px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  room.status === 'Maintenance'
                    ? 'bg-amber-100 border-amber-300 text-amber-850 hover:bg-amber-200'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {room.status === 'Maintenance' ? 'Resume Operations' : 'Flag Maintenance'}
              </button>

              <div className="flex space-x-1.5">
                <button 
                  onClick={() => handleOpenEdit(room)}
                  className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                  title="Edit Specs"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDeleteRoom(room.id)}
                  className="text-slate-400 hover:text-red-650 p-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                  title="Delete Room"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn text-left">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Database className="w-4.5 h-4.5 text-blue-600" />
                  <span>Catalog Room Spec</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Register new classroom specifications in the system.
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <span className="font-extrabold text-sm">×</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Room ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="LH-105"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Smart Classroom 105"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Building Block</label>
                  <select
                    value={roomBuilding}
                    onChange={(e) => setRoomBuilding(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Capacity chairs</label>
                  <input
                    type="number"
                    required
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Owning Department</label>
                <select
                  value={roomDept}
                  onChange={(e) => setRoomDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">AV Assets / Equipment</label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-24 overflow-y-auto">
                  {equipmentOptions.map(eq => (
                    <label key={eq} className="flex items-center space-x-1.5 text-[10px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roomEquip.includes(eq)}
                        onChange={() => handleEquipToggle(eq)}
                        className="rounded bg-slate-550 border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{eq}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Save Spec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn text-left">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit className="w-4.5 h-4.5 text-blue-600" />
                  <span>Edit Room Spec</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Modify registered classroom specifications for {editingRoom.id}.
                </p>
              </div>
              <button 
                onClick={() => setEditingRoom(null)}
                className="text-slate-400 hover:text-slate-650 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <span className="font-extrabold text-sm">×</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Room ID (Read-only)</label>
                  <input
                    type="text"
                    disabled
                    value={roomId}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs text-slate-400 outline-none font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Smart Classroom 105"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Building Block</label>
                  <select
                    value={roomBuilding}
                    onChange={(e) => setRoomBuilding(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Capacity chairs</label>
                  <input
                    type="number"
                    required
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Owning Department</label>
                <select
                  value={roomDept}
                  onChange={(e) => setRoomDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">AV Assets / Equipment</label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-24 overflow-y-auto">
                  {equipmentOptions.map(eq => (
                    <label key={eq} className="flex items-center space-x-1.5 text-[10px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roomEquip.includes(eq)}
                        onChange={() => handleEquipToggle(eq)}
                        className="rounded bg-slate-550 border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{eq}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
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

export default RoomsInventory;
