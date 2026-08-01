import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ListTodo, MapPin, Clock, AlertTriangle, X, Check } from 'lucide-react';

const ApprovalQueue = () => {
  const { bookingQueue, handleApprove, handleReject } = useOutletContext();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-slate-800 animate-fadeIn">
      
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
        <ListTodo className="w-4.5 h-4.5 text-blue-600" />
        <span>Pending Initiatives Queue</span>
      </h3>

      <div className="space-y-4">
        {bookingQueue.filter(b => b.status === 'Pending').length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            All initiative bookings have been processed. No pending requests.
          </div>
        ) : (
          bookingQueue.filter(b => b.status === 'Pending').map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-350 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Submitted by: {item.facultyName} ({item.facultyEmail})</p>
                </div>
                <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded font-mono">
                  {item.id}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] text-slate-600 font-semibold">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-450" />
                  <span>Room: <strong className="text-slate-800">{item.room}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-450" />
                  <span>Slot: <strong className="text-slate-800">{item.timeSlot}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 col-span-2">
                  <span>Roll Tags: <strong className="text-slate-800">{item.rollNumberTags}</strong></span>
                </div>
              </div>

              <div className="text-xs text-slate-650 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-150">
                <strong>Purpose:</strong> {item.reason}
              </div>

              {/* Conflict Notification */}
              {item.conflict && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start space-x-2 text-[10px] text-red-800 shadow-sm shadow-red-500/5">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong>Schedule Conflict Alert:</strong> Room {item.room} already contains a booking during the {item.timeSlot} slot. Approving this will overwrite/overlap schedules.
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleReject(item.id)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-extrabold text-red-650 py-2 px-4 rounded-lg flex items-center space-x-1 uppercase cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-extrabold text-white py-2 px-4 rounded-lg flex items-center space-x-1 uppercase cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Booking</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ApprovalQueue;
