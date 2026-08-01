import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ListTodo, Edit3, StopCircle, Check, X, AlertTriangle } from 'lucide-react';

const StaffOverview = () => {
  const navigate = useNavigate();
  const { rooms, setRooms, bookingQueue } = useOutletContext();

  // Edit Session Modal state
  const [editingRoom, setEditingRoom] = useState(null);
  const [editFaculty, setEditFaculty] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const handleTerminateSession = (roomId) => {
    if (!window.confirm(`Are you sure you want to terminate the active session in Room ${roomId}?`)) return;

    setRooms(prevRooms => prevRooms.map(r => {
      if (r.id === roomId) {
        const curId = r.currentBooking?.id;
        return {
          ...r,
          status: 'Available',
          currentBooking: null,
          bookings: r.bookings.filter(b => b.id !== curId)
        };
      }
      return r;
    }));
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setEditVenue(room.id);
    setEditFaculty(room.currentBooking?.faculty || room.bookings[0]?.user || '');
    setEditTitle(room.currentBooking?.title || room.bookings[0]?.purpose || '');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFaculty || !editTitle) {
      alert("Please fill in all fields.");
      return;
    }

    const oldVenue = editingRoom.id;
    const newVenue = editVenue;

    setRooms(prevRooms => {
      // Find the booking object
      const oldRoomObj = prevRooms.find(r => r.id === oldVenue);
      const activeBooking = oldRoomObj?.currentBooking || oldRoomObj?.bookings[0];

      if (!activeBooking) return prevRooms;

      const updatedBooking = {
        ...activeBooking,
        title: editTitle,
        purpose: editTitle,
        faculty: editFaculty,
        user: editFaculty
      };

      return prevRooms.map(r => {
        // If venue changed
        if (oldVenue !== newVenue) {
          if (r.id === oldVenue) {
            return {
              ...r,
              status: 'Available',
              currentBooking: null,
              bookings: r.bookings.filter(b => b.id !== activeBooking.id)
            };
          }
          if (r.id === newVenue) {
            return {
              ...r,
              status: 'Booked',
              currentBooking: updatedBooking,
              bookings: [...(r.bookings || []), updatedBooking]
            };
          }
        } else {
          // Venue didn't change
          if (r.id === oldVenue) {
            return {
              ...r,
              currentBooking: updatedBooking,
              bookings: r.bookings.map(b => b.id === activeBooking.id ? updatedBooking : b)
            };
          }
        }
        return r;
      });
    });

    setEditingRoom(null);
    alert("Session updated successfully!");
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fadeIn">
      
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pending Requests</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {bookingQueue.filter(b => b.status === 'Pending').length}
          </span>
          <span className="text-[10px] text-amber-500 font-bold block mt-1">Requires Authorization</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Allocated Classrooms</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {rooms.filter(r => r.status === 'Booked').length} / {rooms.length}
          </span>
          <span className="text-[10px] text-[#0052cc] font-bold block mt-1">Currently occupied</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Avg Utilization Rate</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">69.2%</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Optimal Target Met</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Departmental Live Status */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departmental Live Status</h3>
            <p className="text-[11px] text-slate-450">Ongoing active lectures and live attendance OTP verification codes.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const currentBooking = room.currentBooking || room.bookings?.[0];
              return (
                <div key={room.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {room.id}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{room.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {room.status === 'Booked' && currentBooking ? (
                          <span className="text-[#0052cc] font-semibold">Faculty: {currentBooking.faculty || currentBooking.user}</span>
                        ) : (
                          <span>Coordinator: {room.coordinator || "Dr. Rajesh Kumar"}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {room.status === 'Booked' ? (
                      <>
                        <span className="text-[9px] bg-red-50 text-rose-650 border border-red-150 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          Booked ({currentBooking?.timeSlot || "Active"})
                        </span>
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer transition-colors"
                          title="Edit Session (Faculty / Venue)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTerminateSession(room.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-550 cursor-pointer transition-colors"
                          title="Terminate Session"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Next in Queue */}
        <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <ListTodo className="w-4 h-4 text-blue-600" />
            <span>Next in queue</span>
          </h3>
          <div className="space-y-3">
            {bookingQueue.filter(b => b.status === 'Pending').slice(0, 2).map((item) => (
              <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{item.facultyName} • Room {item.room}</p>
                <button 
                  onClick={() => navigate('/staff/approvals')}
                  className="text-[9px] text-[#0052cc] font-extrabold hover:underline block pt-1 cursor-pointer"
                >
                  Authorize Request →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Session Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn text-left">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit3 className="w-4.5 h-4.5 text-blue-600" />
                  <span>Edit Active Session</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Reassign the assigned venue or faculty details for the active session.
                </p>
              </div>
              <button 
                onClick={() => setEditingRoom(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Session Title / Topic *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Faculty *</label>
                <input
                  type="text"
                  required
                  value={editFaculty}
                  onChange={(e) => setEditFaculty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Assign Different Venue (Room)</label>
                <select
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id} disabled={r.status === 'Booked' && r.id !== editingRoom.id}>
                      {r.id} {r.status === 'Booked' && r.id !== editingRoom.id ? '(Occupied)' : ''}
                    </option>
                  ))}
                </select>
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

export default StaffOverview;
