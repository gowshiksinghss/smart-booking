import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const MyBookings = () => {
  const { bookings, setBookingDetailModal } = useOutletContext();
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Room Bookings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Review and manage your pending or active classroom initiatives.</p>
      </div>

      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2.5 px-4 cursor-pointer transition-all ${
            activeTab === 'upcoming' 
              ? 'text-[#0052cc] border-b-2 border-[#0052cc]' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Upcoming Sessions
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-2.5 px-4 cursor-pointer transition-all ${
            activeTab === 'past' 
              ? 'text-[#0052cc] border-b-2 border-[#0052cc]' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Past History Log
        </button>
      </div>

      {activeTab === 'upcoming' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings
            .filter(booking => booking.rawBooking && new Date(booking.rawBooking.endTime) >= new Date())
            .map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#deebff] text-[#0747a6] w-12 h-12 rounded-xl flex flex-col justify-center items-center shrink-0 border border-blue-150">
                      <span className="text-[8px] font-black uppercase leading-none">{booking.date.split(' ')[0]}</span>
                      <span className="text-sm font-black mt-0.5 leading-none">{booking.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{booking.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {booking.room} • {booking.building}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-blue-50 text-blue-800 border border-blue-150 px-2 py-0.5 rounded-lg font-black uppercase">
                    {booking.status}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-5.5 h-5.5 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[7px] font-black text-white uppercase">AK</div>
                      <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[7px] font-black text-white uppercase">SC</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {booking.membersCount} members registered
                    </span>
                  </div>

                  <button 
                    onClick={() => setBookingDetailModal(booking)}
                    className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-[10px] font-black py-2 px-4 rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Verify Details
                  </button>
                </div>
              </div>
            ))}
          {bookings.filter(booking => booking.rawBooking && new Date(booking.rawBooking.endTime) >= new Date()).length === 0 && (
            <div className="col-span-2 bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs font-semibold">
              No upcoming bookings found.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings
            .filter(booking => booking.rawBooking && new Date(booking.rawBooking.endTime) < new Date())
            .map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 text-slate-550 w-12 h-12 rounded-xl flex flex-col justify-center items-center shrink-0 border border-slate-200">
                      <span className="text-[8px] font-black uppercase leading-none">{booking.date.split(' ')[0]}</span>
                      <span className="text-sm font-black mt-0.5 leading-none">{booking.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{booking.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {booking.room} • {booking.building}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-250 px-2 py-0.5 rounded-lg font-black uppercase">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          {bookings.filter(booking => booking.rawBooking && new Date(booking.rawBooking.endTime) < new Date()).length === 0 && (
            <div className="col-span-2 bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs font-semibold">
              No past bookings logged.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MyBookings;
