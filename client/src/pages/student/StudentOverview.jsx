import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Info, ArrowRight } from 'lucide-react';

const StudentOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    rooms, 
    bookings, 
    setSelectedRoomForBooking, 
    bookingInitiatives, 
    getStudentEligibility, 
    setBookingDetailModal 
  } = useOutletContext();

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      
      {/* Welcoming header card */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Adithya K'} 👋
          </h2>
          <div className="flex items-center space-x-2 text-[10px] font-bold">
            <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              ID: {user?.rollNo || '21CS001'}
            </span>
            <span className="bg-[#deebff] text-[#0747a6] border border-blue-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {user?.department || 'Computer Science and Engineering'}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center space-x-2.5 max-w-sm font-semibold">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Quick Tip: Scheduled lab times are active between 09:00 and 14:00.</span>
        </div>
      </div>

      {/* Grid display layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left major column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Available Faculty-Assigned Rooms
            </h3>
            <button 
              onClick={() => navigate('/student/find')}
              className="text-xs text-[#0052cc] font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms
              .filter(r => {
                if (r.status === 'Booked' && bookingInitiatives) {
                  const activeBooking = bookingInitiatives.find(b => b.roomId === r.id);
                  if (activeBooking && getStudentEligibility) {
                    const eligibility = getStudentEligibility(activeBooking, user);
                    if (!eligibility.visible) return false;
                  }
                }
                return true;
              })
              .map(room => {
                const activeBooking = (bookingInitiatives || []).find(b => b.roomId === room.id);
                const eligibility = activeBooking && getStudentEligibility ? getStudentEligibility(activeBooking, user) : { status: 'none' };
                const displayTitle = activeBooking ? activeBooking.title : room.name;
                const displayHours = activeBooking ? activeBooking.timeSlot : room.hours;
                const displayCoordinator = activeBooking ? activeBooking.facultyName : room.coordinator;
                const coordinatorInitials = room.coordinatorInitials || (displayCoordinator.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());

                return (
                  <div 
                    key={room.id} 
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="h-40 relative border-b border-slate-100">
                      <img 
                        src={room.image} 
                        alt={room.name} 
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center ${
                        room.status === 'Available' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white mr-1 inline-block"></span>
                        <span>{room.status}</span>
                      </span>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{displayTitle}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{room.building}, {room.floor} • Room {room.name}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider">HOURS</span>
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[80px] block">{displayHours}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#ffebec] text-[#de350b] flex items-center justify-center text-[10px] font-black border border-[#ffbdad]">
                          {coordinatorInitials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-850 leading-tight">{displayCoordinator}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">FACULTY COORDINATOR</p>
                        </div>
                      </div>

                      {room.status === 'Available' ? (
                        <button
                          onClick={() => setSelectedRoomForBooking(room)}
                          className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 uppercase tracking-wider"
                        >
                          <span>📅 Book Slot</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (activeBooking) {
                              setBookingDetailModal(activeBooking);
                            } else {
                              setBookingDetailModal(room);
                            }
                          }}
                          className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 uppercase tracking-wider border ${
                            eligibility.status === 'ENROLLED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            eligibility.status === 'ELIGIBLE_ENROLL' ? 'bg-blue-600 hover:bg-blue-750 text-white border-transparent' :
                            eligibility.status === 'ELIGIBLE_REQUEST' ? 'bg-indigo-600 hover:bg-indigo-750 text-white border-transparent' :
                            eligibility.status === 'REQUEST_SUBMITTED' ? 'bg-amber-50 text-amber-800 border-amber-250' :
                            'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          <span>
                            {eligibility.status === 'ENROLLED' ? "Enrolled ✓" :
                             eligibility.status === 'ELIGIBLE_ENROLL' ? "Join Session" :
                             eligibility.status === 'ELIGIBLE_REQUEST' ? "Request to Join" :
                             eligibility.status === 'REQUEST_SUBMITTED' ? "Request Pending" :
                             "Booked"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right column sidebar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Upcoming Active Classes
          </h3>
          
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-sm">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-start space-x-3.5 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="bg-[#deebff] text-[#0747a6] w-10 h-10 rounded-lg flex flex-col justify-center items-center shrink-0 border border-blue-100">
                  <span className="text-[7px] font-black uppercase">{booking.date.split(' ')[0]}</span>
                  <span className="text-xs font-bold mt-0.5">{booking.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{booking.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">📍 {booking.room}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">🕒 {booking.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentOverview;
