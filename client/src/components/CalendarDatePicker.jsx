import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarDatePicker = ({ selectedDate, onChange, placeholder = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get day index of the 1st of the month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    let firstDayIndex = new Date(year, month, 1).getDay();
    // Align with Monday as starting index (0 = Mon, ..., 6 = Sun)
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const cells = [];
    
    // Padding from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateKey: formatDateKey(prevDate),
        dateObj: prevDate
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, month, i);
      cells.push({
        day: i,
        isCurrentMonth: true,
        dateKey: formatDateKey(currDate),
        dateObj: currDate
      });
    }
    
    // Padding for next month
    const totalCells = 42; // 6 rows * 7 days
    const nextPadding = totalCells - cells.length;
    for (let i = 1; i <= nextPadding; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push({
        day: i,
        isCurrentMonth: false,
        dateKey: formatDateKey(nextDate),
        dateObj: nextDate
      });
    }
    
    return cells;
  };

  const dayCells = getDaysInMonth(currentMonth);
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const handleSelectDay = (dateKey) => {
    onChange(dateKey);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (!selectedDate) return placeholder;
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return placeholder;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-transparent select-none ${
          selectedDate ? 'text-blue-600 bg-blue-50/50 border-blue-100' : 'text-slate-500'
        }`}
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="text-[11px] font-bold">
          {getDisplayLabel()}
        </span>
      </button>

      {/* Dropdown Calendar Panel (Aligned Right to open inward) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 px-4 z-50 animate-fadeIn select-none">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-slate-800">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
            {weekDays.map(wd => <span key={wd}>{wd}</span>)}
          </div>

          {/* Day Grid cells */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayCells.map((cell, idx) => {
              const isSelected = selectedDate === cell.dateKey;
              const isToday = formatDateKey(new Date()) === cell.dateKey;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.dateKey)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                    !cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'
                  } ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-black shadow-sm shadow-blue-500/10' 
                      : isToday 
                        ? 'bg-blue-50 text-blue-650 border border-blue-200 font-extrabold'
                        : 'hover:bg-slate-100'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

export default CalendarDatePicker;
