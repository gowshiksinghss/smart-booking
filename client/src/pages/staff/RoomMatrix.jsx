import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, ChevronLeft, ChevronRight, Info, PlusCircle, X, Check, AlertTriangle, Layers, Users
} from 'lucide-react';

const RoomMatrix = () => {
  const { rooms, setRooms, bookingQueue, setBookingQueue } = useOutletContext();
  const { user } = useAuth();

  // View States
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'single'
  const [selectedDate, setSelectedDate] = useState(new Date('2026-07-27')); // Anchor date
  const [buildingFilter, setBuildingFilter] = useState('All Blocks');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || 'LH-101');

  // Modals & Details states
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [showRoster, setShowRoster] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('enrolled'); // 'enrolled' or 'join_requests'
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationRoom, setAllocationRoom] = useState(null);
  const [allocationDate, setAllocationDate] = useState(null);
  const [allocationStartTime, setAllocationStartTime] = useState('');
  const [allocationEndTime, setAllocationEndTime] = useState('');
  const [allocationTitle, setAllocationTitle] = useState('');
  const [allocationUser, setAllocationUser] = useState('');
  const [allocationPurpose, setAllocationPurpose] = useState('');
  const [allocationStatus, setAllocationStatus] = useState('Approved');
  const [allocationBookingId, setAllocationBookingId] = useState(null);
  const [allocationType, setAllocationType] = useState('direct'); // 'direct' or 'faculty'
  const [allocationTargetDept, setAllocationTargetDept] = useState('Computer Science and Engineering');
  const [allocationTargetGroup, setAllocationTargetGroup] = useState('');

  // Local success Toast state
  const [toastMsg, setToastMsg] = useState('');

  const triggerLocalToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const timelineScrollRef = useRef(null);

  // Scroll to Operational Hours (08:00 AM = 8 * 60px = 480px) on mount or mode switch
  useEffect(() => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = 480;
    }
  }, [viewMode]);

  // Helper date conversions
  const formatISODate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDateSameDay = (isoString, targetDate) => {
    const parts = isoString.split('T');
    if (parts.length === 0) return false;
    return parts[0] === formatISODate(targetDate);
  };

  // Navigations
  const handleToday = () => {
    setSelectedDate(new Date('2026-07-27')); // Mock anchor today
  };

  const handlePrev = () => {
    const nextDate = new Date(selectedDate);
    if (viewMode === 'all') {
      nextDate.setDate(selectedDate.getDate() - 1);
    } else {
      nextDate.setDate(selectedDate.getDate() - 7);
    }
    setSelectedDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(selectedDate);
    if (viewMode === 'all') {
      nextDate.setDate(selectedDate.getDate() + 1);
    } else {
      nextDate.setDate(selectedDate.getDate() + 7);
    }
    setSelectedDate(nextDate);
  };

  const getWeekDays = (baseDate) => {
    const currentDay = baseDate.getDay();
    // Monday index 0 adjustment
    const distance = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distance);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Time converters
  const getMinutesFromDateString = (isoString) => {
    const parts = isoString.split('T');
    if (parts.length < 2) return 0;
    const timeParts = parts[1].split(':');
    const hr = parseInt(timeParts[0], 10);
    const min = parseInt(timeParts[1], 10);
    return hr * 60 + min;
  };

  const minutesToTimeString = (minutes) => {
    const hr = Math.floor(minutes / 60);
    const min = minutes % 60;
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 === 0 ? 12 : hr % 12;
    const displayMin = String(min).padStart(2, '0');
    return `${displayHr}:${displayMin} ${ampm}`;
  };

  const minutesToHourMinuteString = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Click on track to allocate slot
  const handleTrackClick = (e, row) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // Map horizontal click pixel to 1440 minutes
    const clickedMinutes = Math.floor((clickX / rect.width) * 1440);
    const roundedMinutes = Math.round(clickedMinutes / 15) * 15;

    const startMins = roundedMinutes;
    const endMins = Math.min(startMins + 60, 1440);

    const activeRoom = viewMode === 'all' ? row.roomObj : selectedRoomObj;
    const activeDate = viewMode === 'all' ? selectedDate : row.date;

    setAllocationRoom(activeRoom);
    setAllocationDate(activeDate);
    setAllocationStartTime(minutesToHourMinuteString(startMins));
    setAllocationEndTime(minutesToHourMinuteString(endMins));
    setAllocationTitle('');
    setAllocationUser(user?.name || 'Subramanian M');
    setAllocationPurpose('');
    setAllocationStatus('Approved');
    setAllocationBookingId(null);
    setAllocationType('direct');
    setAllocationTargetDept('Computer Science and Engineering');
    setAllocationTargetGroup('');
    setShowAllocationModal(true);
  };

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!allocationTitle || (allocationType === 'faculty' && !allocationUser)) {
      alert("Please fill in required fields");
      return;
    }

    const [startHour, startMin] = allocationStartTime.split(':').map(Number);
    const [endHour, endMin] = allocationEndTime.split(':').map(Number);

    const startISO = `${formatISODate(allocationDate)}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`;
    const endISO = `${formatISODate(allocationDate)}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`;

    const formatTime12h = (hour, min) => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHr = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHr}:${String(min).padStart(2, '0')} ${ampm}`;
    };
    const timeSlotStr = `${formatTime12h(startHour, startMin)} - ${formatTime12h(endHour, endMin)}`;

    const isDirect = allocationType === 'direct';
    const finalStatus = isDirect ? 'APPROVED' : (allocationStatus === 'Approved' ? 'APPROVED' : allocationStatus);

    const newBooking = {
      id: allocationBookingId || `b-${Date.now()}`,
      bookingId: allocationBookingId || `b-${Date.now()}`,
      title: allocationTitle,
      timeSlot: timeSlotStr,
      startTime: startISO,
      endTime: endISO,
      user: isDirect ? (user?.name || 'Subramanian M') : allocationUser,
      facultyName: isDirect ? (user?.name || 'Subramanian M') : allocationUser,
      purpose: allocationPurpose,
      status: finalStatus,
      initiatedByRole: isDirect ? 'staff' : 'faculty',
      department: 'Computer Science and Engineering',
      targetDepartment: isDirect ? allocationTargetDept : undefined,
      rollNumberTags: isDirect ? allocationTargetGroup : undefined,
      allowJoinRequests: true,
      enrolledStudents: DEFAULT_MOCK_STUDENTS,
      joinRequests: [],
      approvedBy: finalStatus === 'APPROVED' ? 'Subramanian M' : undefined
    };

    const updatedRooms = rooms.map(r => {
      const hadBooking = r.bookings.some(b => b.id === allocationBookingId);
      
      // If editing and venue changed, remove from old room
      if (allocationBookingId && hadBooking && r.id !== allocationRoom.id) {
        return {
          ...r,
          status: r.currentBooking?.id === allocationBookingId ? 'Available' : r.status,
          currentBooking: r.currentBooking?.id === allocationBookingId ? null : r.currentBooking,
          bookings: r.bookings.filter(b => b.id !== allocationBookingId)
        };
      }

      if (r.id === allocationRoom.id) {
        if (allocationBookingId && hadBooking) {
          // Update in same room
          return {
            ...r,
            currentBooking: r.currentBooking?.id === allocationBookingId ? newBooking : r.currentBooking,
            bookings: r.bookings.map(b => b.id === allocationBookingId ? newBooking : b)
          };
        } else {
          // Add to new room (or reassigned venue)
          return {
            ...r,
            status: finalStatus === 'APPROVED' ? 'Booked' : r.status,
            currentBooking: finalStatus === 'APPROVED' ? newBooking : r.currentBooking,
            bookings: [...(r.bookings || []), newBooking]
          };
        }
      }
      return r;
    });

    setRooms(updatedRooms);
    
    if (setBookingQueue) {
      setBookingQueue(prev => {
        if (allocationBookingId && prev.some(b => b.id === allocationBookingId)) {
          return prev.map(b => b.id === allocationBookingId ? newBooking : b);
        } else {
          return [...prev, newBooking];
        }
      });
    }

    triggerLocalToast(allocationBookingId ? `Slot successfully updated for ${allocationRoom.id}!` : `Slot successfully allocated for ${allocationRoom.id}!`);
    setShowAllocationModal(false);
  };

  // Staff manual attendance override handler
  const DEFAULT_MOCK_STUDENTS = [
    { studentId: "student-1", name: "Adithya K", rollNumber: "21CS001", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" },
    { studentId: "student-2", name: "Keerthana S", rollNumber: "21CS045", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: false, attendanceStatus: "ABSENT", lastUpdatedBy: "System" },
    { studentId: "student-3", name: "Abhinav R", rollNumber: "22IT012", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PENDING", lastUpdatedBy: "System" },
    { studentId: "student-4", name: "Sneha P", rollNumber: "22IT098", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" }
  ];

  const handleUpdateStudentAttendance = (studentId, newStatus) => {
    const reason = window.prompt("Reason for manual override (e.g., Medical Certificate, OTP Timeout Error):", "Technical OTP Error");
    if (reason === null) return;
    const updaterName = user?.name || 'Staff';

    setSelectedBookingDetails(prev => {
      const currentStudents = prev.enrolledStudents || DEFAULT_MOCK_STUDENTS;
      return {
        ...prev,
        enrolledStudents: currentStudents.map(s =>
          s.studentId === studentId
            ? { ...s, attendanceStatus: newStatus, lastUpdatedBy: `Manually Updated by ${updaterName} (${reason || 'No reason'})` }
            : s
        )
      };
    });

    setRooms(prev => prev.map(r => ({
      ...r,
      bookings: (r.bookings || []).map(b => {
        if (b.id === selectedBookingDetails?.id) {
          const currentStudents = b.enrolledStudents || DEFAULT_MOCK_STUDENTS;
          return {
            ...b,
            enrolledStudents: currentStudents.map(s =>
              s.studentId === studentId
                ? { ...s, attendanceStatus: newStatus, lastUpdatedBy: `Manually Updated by ${updaterName} (${reason})` }
                : s
            )
          };
        }
        return b;
      })
    })));

    triggerLocalToast(`Attendance manually updated for student.`);
  };

  const handleApproveJoinRequest = (requestId) => {
    const booking = selectedBookingDetails;
    if (!booking) return;

    const request = (booking.joinRequests || []).find(r => r.requestId === requestId);
    if (!request) return;

    const newEnrolledStudent = {
      studentId: request.studentId,
      name: request.name,
      rollNumber: request.rollNumber,
      department: request.department,
      year: request.year,
      semester: request.semester,
      surveyCompleted: false,
      attendanceStatus: 'PENDING',
      lastUpdatedBy: 'Approved Request'
    };

    setRooms(prev => prev.map(r => {
      return {
        ...r,
        bookings: (r.bookings || []).map(b => {
          if (b.id === booking.id) {
            return {
              ...b,
              joinRequests: (b.joinRequests || []).map(jr => jr.requestId === requestId ? { ...jr, status: 'APPROVED' } : jr),
              enrolledStudents: [...(b.enrolledStudents || []), newEnrolledStudent]
            };
          }
          return b;
        })
      };
    }));

    setSelectedBookingDetails(prev => {
      return {
        ...prev,
        joinRequests: (prev.joinRequests || []).map(jr => jr.requestId === requestId ? { ...jr, status: 'APPROVED' } : jr),
        enrolledStudents: [...(prev.enrolledStudents || []), newEnrolledStudent]
      };
    });

    triggerLocalToast(`Approved and enrolled ${request.name}!`);
  };

  const handleDeclineJoinRequest = (requestId) => {
    const booking = selectedBookingDetails;
    if (!booking) return;

    const declineReason = window.prompt("Enter decline reason (optional):", "No slots available / Session full");
    if (declineReason === null) return;

    setRooms(prev => prev.map(r => {
      return {
        ...r,
        bookings: (r.bookings || []).map(b => {
          if (b.id === booking.id) {
            return {
              ...b,
              joinRequests: (b.joinRequests || []).map(jr => jr.requestId === requestId ? { ...jr, status: 'REJECTED', rejectReason: declineReason } : jr)
            };
          }
          return b;
        })
      };
    }));

    setSelectedBookingDetails(prev => {
      return {
        ...prev,
        joinRequests: (prev.joinRequests || []).map(jr => jr.requestId === requestId ? { ...jr, status: 'REJECTED', rejectReason: declineReason } : jr)
      };
    });

    triggerLocalToast("Join request declined.");
  };

  // List of unique blocks
  const buildings = ["All Blocks", ...new Set(rooms.map(r => r.building))];

  // Mode calculations
  let rows = [];
  let selectedRoomObj = null;

  if (viewMode === 'all') {
    const filteredRooms = rooms.filter(r => {
      if (buildingFilter === 'All Blocks') return true;
      return r.building === buildingFilter;
    });

    rows = filteredRooms.map(room => {
      const dayBookings = (room.bookings || []).filter(b => isDateSameDay(b.startTime, selectedDate));
      return {
        id: room.id,
        label: room.id,
        sublabel: `${room.name} (${room.building})`,
        bookings: dayBookings,
        roomObj: room
      };
    });
  } else {
    selectedRoomObj = rooms.find(r => r.id === selectedRoomId) || rooms[0];
    const weekDays = getWeekDays(selectedDate);

    rows = weekDays.map(day => {
      const dateStr = formatISODate(day);
      const dayBookings = (selectedRoomObj?.bookings || []).filter(b => isDateSameDay(b.startTime, day));
      return {
        id: dateStr,
        label: day.toLocaleDateString('en-US', { weekday: 'long' }),
        sublabel: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: day,
        bookings: dayBookings,
        roomObj: selectedRoomObj
      };
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn relative">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4.5 h-4.5 text-[#0052cc]" />
            <span>Interactive Department Room Grid Matrix</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Visual map showing room allocation across official classroom blocks and academic hours.
          </p>
        </div>

        {/* View Mode Toggle Pill Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-500 self-start md:self-auto shrink-0 select-none">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'all'
                ? 'bg-white text-[#0052cc] shadow-sm'
                : 'hover:text-slate-800'
            }`}
          >
            All Rooms View
          </button>
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'single'
                ? 'bg-white text-[#0052cc] shadow-sm'
                : 'hover:text-slate-800'
            }`}
          >
            Single Room - 7 Day View
          </button>
        </div>
      </div>

      {/* Control Panel: Filters, Navigator and Date Picker */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Date Navigator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToday}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition-colors"
          >
            Today
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-slate-50 rounded-l-xl text-slate-600 transition-colors cursor-pointer border-r border-slate-200"
              title={viewMode === 'all' ? "Previous Day" : "Previous Week"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Interactive Calendar Icon Picker Wrapper */}
            <div className="relative flex items-center px-4 py-1.5 hover:bg-slate-50 transition-all select-none cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-[#0052cc] mr-2" />
              <span className="text-xs font-bold text-slate-700">
                {viewMode === 'all' 
                  ? formatDisplayDate(selectedDate)
                  : `Week of ${getWeekDays(selectedDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                }
              </span>
              <input 
                type="date"
                value={formatISODate(selectedDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={handleNext}
              className="p-2 hover:bg-slate-50 rounded-r-xl text-slate-600 transition-colors cursor-pointer border-l border-slate-200"
              title={viewMode === 'all' ? "Next Day" : "Next Week"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room Filter Dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          {viewMode === 'all' ? (
            <>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Building Block:</span>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold outline-none shadow-sm focus:border-blue-500"
              >
                {buildings.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Choose Room:</span>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold outline-none shadow-sm focus:border-blue-500"
              >
                {rooms.map(r => <option key={r.id} value={r.id}>{r.id} - {r.name}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Gantt Timeline Scheduler Grid */}
      <div className="flex border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner">
        
        {/* Left Column: Sticky Labels */}
        <div className="w-44 shrink-0 bg-slate-50 border-r border-slate-200 divide-y divide-slate-150 select-none">
          <div className="h-12 flex items-center px-4 bg-slate-100 border-b border-slate-200 text-[9px] font-black text-slate-450 uppercase tracking-widest">
            {viewMode === 'all' ? 'Classrooms' : 'Day of Week'}
          </div>
          {rows.map((row) => (
            <div key={row.id} className="h-20 flex flex-col justify-center px-4 bg-white">
              <span className="font-extrabold text-xs text-slate-900 leading-tight">{row.label}</span>
              <span className="text-[10px] text-slate-450 mt-0.5 font-bold truncate">{row.sublabel}</span>
            </div>
          ))}
        </div>

        {/* Right Side: Scrollable Timeline Tracks */}
        <div ref={timelineScrollRef} className="flex-1 overflow-x-auto divide-y divide-slate-150 relative scroll-smooth bg-slate-50/10">
          
          {/* Timeline Header (Hour Ticks) */}
          <div className="h-12 w-[1440px] flex bg-slate-100 border-b border-slate-200 select-none">
            {Array.from({ length: 24 }).map((_, hour) => {
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              return (
                <div key={hour} className="w-[60px] shrink-0 border-r border-slate-200/40 h-full flex flex-col justify-end pb-2 text-center">
                  <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter">
                    {displayHour} {ampm}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline Tracks */}
          {rows.map((row) => (
            <div 
              key={row.id} 
              className="h-20 w-[1440px] relative flex bg-emerald-50/15 hover:bg-slate-50/40 transition-colors divide-x divide-slate-150/30 cursor-pointer select-none"
              onClick={(e) => handleTrackClick(e, row)}
              title="Click empty space to allocate new slot"
            >
              {/* Hour segments */}
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-[60px] h-full shrink-0 border-r border-slate-200/20 pointer-events-none" />
              ))}

              {/* Booking blocks overlay */}
              <div className="absolute inset-0 pointer-events-auto">
                {row.bookings.map((booking) => {
                  const startMinutes = getMinutesFromDateString(booking.startTime);
                  const endMinutes = getMinutesFromDateString(booking.endTime);
                  const duration = endMinutes - startMinutes;
                  
                  let blockStyle = "bg-blue-600 border-blue-700 text-white shadow-blue-500/10";
                  if (booking.status === 'Pending') {
                    blockStyle = "bg-amber-500 border-amber-600 text-white shadow-amber-500/10";
                  } else if (booking.status === 'Maintenance') {
                    blockStyle = "bg-slate-700 border-slate-800 text-white bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:14px_14px]";
                  }

                  return (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop allocation modal trigger
                        setSelectedBookingDetails({ ...booking, room: viewMode === 'all' ? row.id : selectedRoomId });
                      }}
                      className={`absolute h-[52px] top-[14px] rounded-xl border flex flex-col justify-center px-3 shadow-md cursor-pointer hover:scale-[1.01] hover:brightness-95 transition-all select-none overflow-hidden ${blockStyle}`}
                      style={{
                        left: `${startMinutes}px`,
                        width: `${Math.max(duration, 40)}px` // ensure minimal size is visible
                      }}
                    >
                      <div className="text-[10px] font-black truncate leading-tight">
                        {booking.title || booking.purpose}
                      </div>
                      <div className="text-[8.5px] font-bold opacity-90 truncate mt-0.5">
                        {booking.user} • {minutesToTimeString(startMinutes)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend guide info */}
      <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-500 select-none bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl">
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 block"></span>
          <span>Available Track</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-blue-600 border border-blue-700 block"></span>
          <span>Approved Event</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-amber-500 border border-amber-600 block"></span>
          <span>Pending Request</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-slate-700 border border-slate-800 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:6px_6px] block"></span>
          <span>Maintenance</span>
        </span>
      </div>

      {/* Booking Details Modal */}
      {selectedBookingDetails && (() => {
        const studentsList = selectedBookingDetails.enrolledStudents || DEFAULT_MOCK_STUDENTS;
        const checkedInCount = studentsList.filter(s => s.attendanceStatus === 'PRESENT').length;
        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className={`bg-white border border-slate-200 rounded-2xl w-full shadow-2xl animate-scaleUp text-left flex flex-col max-h-[90vh] transition-all duration-300 ${showRoster ? 'max-w-3xl' : 'max-w-sm'}`}>
              
              {/* ── Sticky Header ── */}
              <div className="flex justify-between items-start px-6 pt-5 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl shrink-0">
                <div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                    selectedBookingDetails.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    selectedBookingDetails.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {selectedBookingDetails.status}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-2 leading-snug max-w-xs">
                    {selectedBookingDetails.title || selectedBookingDetails.purpose}
                  </h4>
                </div>
                <button 
                  onClick={() => { setSelectedBookingDetails(null); setShowRoster(false); }}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors shrink-0 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

              {/* Core details */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-slate-400">Classroom Room</span>
                  <span className="font-extrabold text-slate-800">{selectedBookingDetails.room}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-slate-400">Time Duration</span>
                  <span className="font-extrabold text-slate-800">{selectedBookingDetails.timeSlot}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-slate-400">Faculty/User</span>
                  <span className="font-extrabold text-[#0052cc]">{selectedBookingDetails.user}</span>
                </div>
                {selectedBookingDetails.purpose && (
                  <div className="flex flex-col space-y-0.5 pt-1.5 border-t border-slate-50">
                    <span className="font-bold text-slate-400">Event Purpose</span>
                    <span className="font-medium text-slate-650 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {selectedBookingDetails.purpose}
                    </span>
                  </div>
                )}
                {selectedBookingDetails.approvedBy && (
                  <div className="flex justify-between py-0.5 pt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Approved By</span>
                    <span className="text-slate-600">{selectedBookingDetails.approvedBy}</span>
                  </div>
                )}
              </div>

              {/* Expandable Student Attendance Roster / Join Requests */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRoster(!showRoster)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer select-none bg-slate-50 hover:bg-slate-100/80 px-3 rounded-xl transition-all"
                >
                  <span className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-[#0052cc]" />
                    <span>Student Attendance & Join Requests</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-[#0052cc] px-2 py-0.5 rounded-full font-extrabold shrink-0 ml-2">
                    {(selectedBookingDetails.joinRequests || []).filter(r => r.status === 'PENDING').length} Pending Requests
                  </span>
                </button>

                {showRoster && (
                  <div className="mt-3 space-y-3">
                    {/* Tabs selector */}
                    <div className="flex border-b border-slate-100 mb-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveModalTab('enrolled')}
                        className={`flex-1 pb-2 text-xs font-bold border-b-2 transition-all ${
                          activeModalTab === 'enrolled'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-400 hover:text-slate-650'
                        }`}
                      >
                        Enrolled & Attendance ({studentsList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModalTab('join_requests')}
                        className={`flex-1 pb-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
                          activeModalTab === 'join_requests'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-400 hover:text-slate-650'
                        }`}
                      >
                        <span>Join Requests</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          (selectedBookingDetails.joinRequests || []).filter(r => r.status === 'PENDING').length > 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {(selectedBookingDetails.joinRequests || []).length}
                        </span>
                      </button>
                    </div>

                    {activeModalTab === 'enrolled' ? (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white max-h-60 overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                              <th className="p-2 pl-3">Student Profile</th>
                              <th className="p-2">Roll No</th>
                              <th className="p-2">Academic Details</th>
                              <th className="p-2">Survey</th>
                              <th className="p-2">Attendance</th>
                              <th className="p-2 pr-3 text-right">Override</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {studentsList.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-4 text-center text-slate-400 font-bold">
                                  No students enrolled in this session.
                                </td>
                              </tr>
                            ) : (
                              studentsList.map((std) => {
                                const deptAbbr = std.department
                                  ? std.department.toLowerCase().includes('computer') ? 'CSE'
                                    : std.department.toLowerCase().includes('information') ? 'IT'
                                    : std.department.toLowerCase().includes('mechanical') ? 'ME'
                                    : std.department.toLowerCase().includes('electrical') ? 'EEE'
                                    : std.department
                                  : '';
                                return (
                                  <tr key={std.studentId} className="hover:bg-slate-50/50">
                                    <td className="p-2 pl-3 font-semibold text-slate-900">
                                      <div className="flex items-center space-x-2">
                                        <img
                                          src={std.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${std.name}`}
                                          alt={std.name}
                                          className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200"
                                        />
                                        <span>{std.name}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 font-mono font-bold text-slate-600">{std.rollNumber || std.rollNo}</td>
                                    <td className="p-2 text-slate-500 font-semibold">
                                      <span className="font-extrabold text-[#0052cc]">{deptAbbr}</span>
                                      <span className="mx-1">|</span>
                                      <span>{std.year} • {std.semester}</span>
                                    </td>
                                    <td className="p-2">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                        std.surveyCompleted
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-slate-100 text-slate-400 border-slate-200'
                                      }`}>
                                        {std.surveyCompleted ? '✓ Done' : 'Pending'}
                                      </span>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex flex-col space-y-0.5">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border inline-flex items-center max-w-max uppercase ${
                                          std.attendanceStatus === 'PRESENT' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                          std.attendanceStatus === 'ABSENT' ? 'bg-red-50 text-red-800 border-red-200' :
                                          'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}>
                                          {std.attendanceStatus === 'PRESENT' && <span className="mr-1">✓</span>}
                                          {std.attendanceStatus === 'ABSENT' && <span className="mr-1">✗</span>}
                                          {std.attendanceStatus}
                                        </span>
                                        {std.lastUpdatedBy && (
                                          <span className="text-[8px] text-slate-400 font-bold leading-none">{std.lastUpdatedBy}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2 pr-3 text-right">
                                      <select
                                        value={std.attendanceStatus}
                                        onChange={(e) => handleUpdateStudentAttendance(std.studentId, e.target.value)}
                                        className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                                      >
                                        <option value="PRESENT">Present</option>
                                        <option value="ABSENT">Absent</option>
                                        <option value="PENDING">Pending</option>
                                      </select>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white max-h-60 overflow-y-auto animate-fadeIn">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                              <th className="p-2 pl-3">Student Profile</th>
                              <th className="p-2">Roll Number</th>
                              <th className="p-2">Academic Details</th>
                              <th className="p-2">Request Note / Reason</th>
                              <th className="p-2 pr-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedBookingDetails.joinRequests || []).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-slate-400 font-bold">
                                  No join requests submitted for this session.
                                </td>
                              </tr>
                            ) : (
                              (selectedBookingDetails.joinRequests || []).map((req) => {
                                const deptAbbr = req.department ? (req.department.toLowerCase().includes('computer') ? 'CSE' : req.department.toLowerCase().includes('information') ? 'IT' : req.department.toLowerCase().includes('mechanical') ? 'ME' : req.department.toLowerCase().includes('electrical') ? 'EEE' : req.department) : '';
                                return (
                                  <tr key={req.requestId} className="hover:bg-slate-50/50">
                                    <td className="p-2 pl-3 font-semibold text-slate-900">
                                      <div className="flex items-center space-x-2">
                                        <img
                                          src={req.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.name}`}
                                          alt={req.name}
                                          className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200"
                                        />
                                        <span>{req.name}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 font-mono font-bold text-slate-600">{req.rollNumber}</td>
                                    <td className="p-2 text-slate-500 font-semibold">
                                      <span className="font-extrabold text-[#0052cc]">{deptAbbr}</span>
                                      <span className="mx-1">|</span>
                                      <span>{req.year} • {req.semester}</span>
                                    </td>
                                    <td className="p-2 text-slate-600 font-medium italic">
                                      "{req.reasonNote || 'No reason provided.'}"
                                    </td>
                                    <td className="p-2 pr-3 text-right">
                                      {req.status === 'PENDING' ? (
                                        <div className="flex items-center justify-end space-x-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleApproveJoinRequest(req.requestId)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2 py-1 rounded uppercase tracking-wider cursor-pointer transition-colors"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeclineJoinRequest(req.requestId)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] px-2 py-1 rounded uppercase tracking-wider cursor-pointer transition-colors"
                                          >
                                            Decline
                                          </button>
                                        </div>
                                      ) : (
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${
                                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                                        }`}>
                                          {req.status}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    const booking = selectedBookingDetails;
                    const roomObj = rooms.find(r => r.id === booking.room);
                    setAllocationRoom(roomObj || rooms[0]);
                    setAllocationDate(new Date(booking.startTime));
                    setAllocationStartTime(minutesToHourMinuteString(getMinutesFromDateString(booking.startTime)));
                    setAllocationEndTime(minutesToHourMinuteString(getMinutesFromDateString(booking.endTime)));
                    setAllocationTitle(booking.title || booking.purpose);
                    setAllocationUser(booking.user);
                    setAllocationPurpose(booking.purpose || '');
                    setAllocationStatus(booking.status);
                    setAllocationBookingId(booking.id);
                    setSelectedBookingDetails(null);
                    setShowRoster(false);
                    setShowAllocationModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Edit / Reassign
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to terminate this session?`)) {
                      const booking = selectedBookingDetails;
                      setRooms(prevRooms => prevRooms.map(r => {
                        if (r.id === booking.room) {
                          return {
                            ...r,
                            bookings: r.bookings.filter(b => b.id !== booking.id),
                            currentBooking: r.currentBooking?.id === booking.id ? null : r.currentBooking,
                            status: r.currentBooking?.id === booking.id ? 'Available' : r.status
                          };
                        }
                        return r;
                      }));
                      triggerLocalToast("Session terminated successfully.");
                      setSelectedBookingDetails(null);
                      setShowRoster(false);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Terminate
                </button>
              </div>

              <button
                onClick={() => { setSelectedBookingDetails(null); setShowRoster(false); }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Details
              </button>

              </div>{/* end scrollable body */}

            </div>
          </div>
        );
      })()}

      {/* Allocate Slot Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scaleUp text-left">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <PlusCircle className="w-4.5 h-4.5 text-blue-600" />
                  <span>Allocate Time Slot</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Lodge a fresh schedule reservation for Room {allocationRoom?.id} on {allocationDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                </p>
              </div>
              <button 
                onClick={() => setShowAllocationModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => {
                  setAllocationType('direct');
                  setAllocationStatus('Approved');
                }}
                className={`flex-1 text-[10px] font-black py-2 px-2.5 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
                  allocationType === 'direct'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Staff Direct Booking
              </button>
              <button
                type="button"
                onClick={() => setAllocationType('faculty')}
                className={`flex-1 text-[10px] font-black py-2 px-2.5 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
                  allocationType === 'faculty'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Allocate for Faculty
              </button>
            </div>

            {allocationType === 'direct' && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-2.5 flex items-center space-x-2 animate-fadeIn">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-wide">
                  Room Allocated & Confirmed Instantly (Staff Privilege)
                </span>
              </div>
            )}

            <form onSubmit={handleAllocateSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={allocationStartTime}
                    onChange={(e) => setAllocationStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={allocationEndTime}
                    onChange={(e) => setAllocationEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Event/Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder={allocationType === 'direct' ? "e.g. Department Staff Briefing" : "e.g. Theory Exam / Maintenance Review"}
                  value={allocationTitle}
                  onChange={(e) => setAllocationTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {allocationType === 'faculty' && (
                <>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Faculty / User *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Kumar / System Admin"
                      value={allocationUser}
                      onChange={(e) => setAllocationUser(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Reservation Type</label>
                      <select
                        value={allocationStatus}
                        onChange={(e) => setAllocationStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                      >
                        <option value="Approved">Approved Event</option>
                        <option value="Pending">Pending Approval</option>
                        <option value="Maintenance">Maintenance Block</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="text-[9px] text-slate-400 font-medium pb-2 select-none">
                        Status will take effect instantly in matrix view.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {allocationType === 'direct' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Department</label>
                    <select
                      value={allocationTargetDept}
                      onChange={(e) => setAllocationTargetDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Computer Science and Engineering">Computer Science & Eng</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electrical and Electronics Engineering">Electrical & Electronics Eng</option>
                      <option value="Mechanical Engineering">Mechanical Eng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Custom Roll No Group</label>
                    <input
                      type="text"
                      placeholder="e.g. 21CS001, 21CS042"
                      value={allocationTargetGroup}
                      onChange={(e) => setAllocationTargetGroup(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Agenda / Details</label>
                <textarea
                  rows={2}
                  placeholder="Details of the classroom reservation..."
                  value={allocationPurpose}
                  onChange={(e) => setAllocationPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none resize-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-slideIn">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  );
};

export default RoomMatrix;
