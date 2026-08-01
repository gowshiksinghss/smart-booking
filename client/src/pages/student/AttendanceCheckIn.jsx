import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, X, Clock } from 'lucide-react';
import CalendarDatePicker from '../../components/CalendarDatePicker';

const AttendanceCheckIn = () => {
  const { attendanceHistory, setShowOtpModal } = useOutletContext();
  const [filterType, setFilterType] = useState('Today'); // 'Today', 'All', 'Custom'
  const [customDate, setCustomDate] = useState(''); // 'YYYY-MM-DD'

  // Filter logic
  const filteredHistory = attendanceHistory.filter((item) => {
    if (filterType === 'All') return true;

    // Extract the date part (e.g. "Aug 1, 2026") from "Aug 1, 2026 • 10:00 AM"
    const recordDateStr = item.date.split(' • ')[0];
    const recordDate = new Date(recordDateStr);

    if (filterType === 'Today') {
      const today = new Date();
      return recordDate.getFullYear() === today.getFullYear() &&
             recordDate.getMonth() === today.getMonth() &&
             recordDate.getDate() === today.getDate();
    }

    if (filterType === 'Custom') {
      if (!customDate) return false;
      const [year, month, day] = customDate.split('-').map(Number);
      return recordDate.getFullYear() === year &&
             recordDate.getMonth() === (month - 1) &&
             recordDate.getDate() === day;
    }

    return true;
  });

  const getFormattedCustomDate = () => {
    if (!customDate) return '';
    try {
      const [year, month, day] = customDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      
      {/* Attendance list table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm relative z-10">
        <div className="p-4 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xs font-bold text-slate-850 uppercase tracking-widest">
            Attendance Verification Records
          </h3>

          {/* Filtering options: Today, All, Calendar Icon */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterType('Today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'Today'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilterType('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'All'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All
            </button>

            {/* Custom CalendarDatePicker Component */}
            <CalendarDatePicker
              selectedDate={filterType === 'Custom' ? customDate : ''}
              onChange={(date) => {
                setCustomDate(date);
                setFilterType('Custom');
              }}
              placeholder="Select Date"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 rounded-b-2xl overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No attendance records found for {filterType === 'Today' ? 'today' : filterType === 'Custom' ? getFormattedCustomDate() : 'this selection'}.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    item.status === 'PRESENT' 
                      ? 'bg-emerald-50 text-emerald-500 border-emerald-100' 
                      : item.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-red-50 text-red-500 border-red-100'
                  }`}>
                    {item.status === 'PRESENT' ? (
                      <Check className="w-4 h-4" />
                    ) : item.status === 'PENDING' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[10px] text-slate-450 font-medium mt-0.5">{item.date}</p>
                  </div>
                </div>

                {/* Status or Mark Attendance Action Button */}
                {item.status === 'PENDING' ? (
                  <button
                    onClick={() => setShowOtpModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/10 shrink-0"
                  >
                    Mark Attendance
                  </button>
                ) : (
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded border uppercase ${
                    item.status === 'PRESENT' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default AttendanceCheckIn;
