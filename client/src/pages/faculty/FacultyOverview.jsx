import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Timer, FileText, Megaphone, AlertTriangle } from 'lucide-react';

const FacultyOverview = () => {
  const navigate = useNavigate();
  const { bookingList, surveys, notificationList } = useOutletContext();

  return (
    <div className="space-y-6 text-slate-800 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Welcome, Dr. Rajesh Kumar</span>
            <span className="text-[10px] bg-blue-100 text-[#0052cc] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Faculty Profile
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Department of Computer Science & Engineering • Academic Year 2026-27
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 p-3 rounded-xl max-w-sm">
          <Timer className="w-4 h-4 text-[#0052cc] shrink-0" />
          <span>Active classes are monitored automatically via live OTP telemetry.</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Bookings</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">3</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">● 1 Live Ongoing</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pending Approvals</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">1</span>
              <span className="text-[10px] text-amber-500 font-bold block mt-1">● Awaiting Queue</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Survey Gates</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{surveys.length}</span>
              <span className="text-[10px] text-blue-600 font-bold block mt-1">● Attached to OTP</span>
            </div>
          </div>

          {/* Recent Booking Initiatives list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recent Classroom Bookings
                </h3>
                <p className="text-[11px] text-slate-400">Classrooms managed and authorized for your curriculum schedules.</p>
              </div>
              <button 
                onClick={() => navigate('/faculty/request')}
                className="text-xs text-[#0052cc] font-bold hover:underline cursor-pointer"
              >
                Initiate New Booking
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {bookingList.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs font-extrabold">
                      {item.room.split(' ')[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">📍 Room {item.room} • {item.timeSlot} • {item.date}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                    item.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    item.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History / Status Side Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Initiative Request Tracker Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Initiatives Log</span>
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {bookingList.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]" title={item.title}>
                      {item.title}
                    </h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      item.status === 'Pending' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-550 space-y-1 font-semibold">
                    <p>Room: <span className="font-bold text-slate-800">{item.room}</span></p>
                    <p>Time: <span className="font-bold text-slate-800">{item.timeSlot}</span></p>
                    {item.conflict && (
                      <div className="flex items-center space-x-1 text-red-600 font-bold mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Schedule Conflict Warning</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcasts History list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span>Sent Alerts Log</span>
            </h3>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {notificationList.map((n) => (
                <div key={n.id} className="bg-slate-50 border border-slate-250 rounded-xl p-3 text-[10px] text-slate-650 space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{n.title}</span>
                    <span className="text-[8px] text-slate-400 font-semibold">{new Date(n.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-500 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyOverview;
