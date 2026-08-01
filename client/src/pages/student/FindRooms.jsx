import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Clock, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FindRooms = () => {
  const { user } = useAuth();
  const { 
    rooms, 
    searchQuery, setSearchQuery,
    selectedBuilding, setSelectedBuilding,
    selectedFloor, setSelectedFloor,
    selectedCapacity, setSelectedCapacity,
    selectedTime, setSelectedTime,
    setBookingDetailModal,
    setSelectedRoomForBooking,
    bookingInitiatives,
    getStudentEligibility
  } = useOutletContext();

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Find Classrooms</h2>
          <p className="text-xs text-slate-400 mt-0.5">Locate available workspaces across academic blocks.</p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by room, building, capacity, or staff name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-[#0052cc] transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Filter bar row */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold text-slate-850 uppercase tracking-wide flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Interactive Search Filters</span>
          </span>
          <button 
            onClick={() => {
              setSelectedBuilding('All Buildings');
              setSelectedFloor('Any Floor');
              setSelectedCapacity('Any Size');
              setSelectedTime('Now');
            }}
            className="text-xs text-[#0052cc] font-bold hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
          <div>
            <label className="block mb-1.5 text-[10px]">Academic Building</label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
            >
              <option>All Buildings</option>
              <option>Tech Park</option>
              <option>Science Block</option>
              <option>Innovation Hub</option>
            </select>
          </div>
          <div>
            <label className="block mb-1.5 text-[10px]">Target Floor</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
            >
              <option>Any Floor</option>
              <option>Floor 1</option>
              <option>Floor 4</option>
            </select>
          </div>
          <div>
            <label className="block mb-1.5 text-[10px]">Required Seats</label>
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
            >
              <option>Any Size</option>
              <option>10-30 seats</option>
              <option>30-60 seats</option>
            </select>
          </div>
          <div>
            <label className="block mb-1.5 text-[10px]">Timing Slot</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
            >
              <option>Now</option>
              <option>Later today</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms
          .filter(r => {
            // Apply Discoverability Constraint
            if (r.status === 'Booked' && bookingInitiatives) {
              const activeBooking = bookingInitiatives.find(b => b.roomId === r.id);
              if (activeBooking && getStudentEligibility) {
                const eligibility = getStudentEligibility(activeBooking, user);
                if (!eligibility.visible) return false;
              }
            }

            // Apply Search Query
            const query = searchQuery.toLowerCase();
            const matchesQuery = r.name.toLowerCase().includes(query) || 
                                 r.building.toLowerCase().includes(query) ||
                                 (r.coordinator && r.coordinator.toLowerCase().includes(query)) ||
                                 (r.currentBooking?.faculty && r.currentBooking.faculty.toLowerCase().includes(query)) ||
                                 (r.bookings?.some(b => b.user && b.user.toLowerCase().includes(query)));
            
            // Apply Building Filter
            const matchesBuilding = selectedBuilding === 'All Buildings' || r.building === selectedBuilding;
            
            // Apply Floor Filter
            const matchesFloor = selectedFloor === 'Any Floor' || r.floor === selectedFloor;

            // Apply Capacity Filter
            let matchesCapacity = true;
            if (selectedCapacity === '10-30 seats') {
              matchesCapacity = r.capacity >= 10 && r.capacity <= 30;
            } else if (selectedCapacity === '30-60 seats') {
              matchesCapacity = r.capacity > 30 && r.capacity <= 60;
            }

            return matchesQuery && matchesBuilding && matchesFloor && matchesCapacity;
          })
          .map(room => {
            const activeBooking = (bookingInitiatives || []).find(b => b.roomId === room.id);
            const eligibility = activeBooking && getStudentEligibility ? getStudentEligibility(activeBooking, user) : { status: 'none' };
            const displayTitle = activeBooking ? activeBooking.title : room.name;
            const displayHours = activeBooking ? activeBooking.timeSlot : room.hours;

            return (
              <div 
                key={room.id}
                onClick={() => {
                  if (room.status === 'Available') {
                    setSelectedRoomForBooking(room);
                  } else {
                    if (activeBooking) {
                      setBookingDetailModal(activeBooking);
                    } else {
                      setBookingDetailModal(room);
                    }
                  }
                }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex hover:border-slate-350 transition-all cursor-pointer"
              >
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-28 h-28 object-cover shrink-0 border-r border-slate-100"
                />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{displayTitle}</h4>
                      <span className={`text-[9px] border px-2 py-0.5 rounded font-black uppercase ${
                        room.status === 'Available' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{room.building} Block • {room.floor} • Room {room.name}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold border-t border-slate-50 pt-2">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-450" />
                        <span className="truncate max-w-[80px]">{displayHours}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-450" />
                        <span>{room.capacity} Chairs</span>
                      </span>
                    </div>

                    {room.status === 'Available' ? (
                      <span className="text-[#0052cc] hover:text-[#0747a6] text-[10px] font-black uppercase tracking-wider ml-auto">Book Slot →</span>
                    ) : (
                      <span className="ml-auto">
                        {eligibility.status === 'ENROLLED' && (
                          <span className="text-emerald-600 text-[10px] font-black uppercase tracking-wider">Enrolled</span>
                        )}
                        {eligibility.status === 'ELIGIBLE_ENROLL' && (
                          <span className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-wider">Join Session →</span>
                        )}
                        {eligibility.status === 'ELIGIBLE_REQUEST' && (
                          <span className="text-indigo-650 hover:text-indigo-800 text-[10px] font-black uppercase tracking-wider">Request to Join →</span>
                        )}
                        {eligibility.status === 'REQUEST_SUBMITTED' && (
                          <span className="text-amber-600 text-[10px] font-black uppercase tracking-wider">Request Pending</span>
                        )}
                        {eligibility.status === 'none' && (
                          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Booked</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
};

export default FindRooms;
