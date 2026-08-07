import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Calendar, ChevronLeft, ChevronRight, Info, AlertTriangle, 
  Check, X, ShieldAlert, Edit, ArrowRight, Users 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const GlobalBookingsMatrix = ({ roomsList, setRoomsList, triggerToast, refreshData }) => {
  const { user } = useAuth();
  const { usersList } = useOutletContext();
  const [viewMode, setViewMode] = useState('all'); // 'all' (All Rooms) | 'single' (Single Room 7-Day)
  const [selectedDate, setSelectedDate] = useState(new Date('2026-07-27')); // Mock anchor date
  
  // Filter states
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All Types');
  
  const [selectedRoomId, setSelectedRoomId] = useState(''); // for single room view

  // Detail Modal states
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [showRoster, setShowRoster] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('enrolled'); // 'enrolled' or 'join_requests'
  
  // Reallocation form state inside modal
  const [isReallocating, setIsReallocating] = useState(false);
  const [reallocateRoomId, setReallocateRoomId] = useState('');
  const [reallocateDate, setReallocateDate] = useState('');
  const [reallocateStartTime, setReallocateStartTime] = useState('');
  const [reallocateEndTime, setReallocateEndTime] = useState('');

  // Allocation/Assignment Modal states
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationRoom, setAllocationRoom] = useState(null);
  const [allocationDate, setAllocationDate] = useState(null);
  const [allocationStartTime, setAllocationStartTime] = useState('');
  const [allocationEndTime, setAllocationEndTime] = useState('');
  const [allocationTitle, setAllocationTitle] = useState('');
  const [allocationUser, setAllocationUser] = useState('');
  const [allocationPurpose, setAllocationPurpose] = useState('');

  const timelineScrollRef = useRef(null);

  // Auto scroll to 8:00 AM (480px)
  useEffect(() => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = 480;
    }
  }, [viewMode, selectedRoomId]);

  // Set default room for single view
  useEffect(() => {
    if (roomsList.length > 0 && !selectedRoomId) {
      setSelectedRoomId(roomsList[0].id);
    }
  }, [roomsList, selectedRoomId]);

  // Metadata arrays
  const departments = ["All Departments", "Computer Science and Engineering", "Information Technology", "Mechanical Engineering", "Electrical & Electronics Engineering"];
  const blocks = ["All Blocks", "SF Block", "IB Block", "Mechanical Block", "Auditorium Block"];
  const roomTypes = ["All Types", "CLASSROOM", "RESEARCH LAB", "SEMINAR HALL", "AUDITORIUM"];

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
    setSelectedDate(new Date('2026-07-27'));
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

  // Time utilities
  const getMinutesFromDateString = (isoString) => {
    const parts = isoString.split('T');
    if (parts.length < 2) return 0;
    const timeParts = parts[1].split(':');
    return parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
  };

  const minutesToTimeString = (minutes) => {
    const hr = Math.floor(minutes / 60);
    const min = minutes % 60;
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 === 0 ? 12 : hr % 12;
    return `${displayHr}:${String(min).padStart(2, '0')} ${ampm}`;
  };

  const minutesToHourMinuteString = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // ADMIN ACTIONS:
  const handleForceApprove = (bookingId, roomId) => {
    setRoomsList(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          bookings: r.bookings.map(b => b.id === bookingId ? { ...b, status: 'Approved', approvedBy: 'Admin Override' } : b)
        };
      }
      return r;
    }));
    triggerToast("Booking approved via administrative force action.");
    setSelectedBookingDetails(null);
  };

  const handleAdminCancel = (bookingId, roomId) => {
    const reason = window.prompt("Enter cancellation reason (e.g. Reserved for Institutional Event):", "Reserved for Institutional Event");
    if (reason === null) return; // cancel click

    setRoomsList(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          bookings: r.bookings.filter(b => b.id !== bookingId),
          currentBooking: r.currentBooking?.id === bookingId ? null : r.currentBooking,
          status: r.currentBooking?.id === bookingId ? 'Available' : r.status
        };
      }
      return r;
    }));
    triggerToast("Booking administratively cancelled.");
    setSelectedBookingDetails(null);
  };

  const handleOpenReallocate = (booking) => {
    setIsReallocating(true);
    setReallocateRoomId(booking.room);
    setReallocateDate(booking.startTime.split('T')[0]);
    setReallocateStartTime(minutesToHourMinuteString(getMinutesFromDateString(booking.startTime)));
    setReallocateEndTime(minutesToHourMinuteString(getMinutesFromDateString(booking.endTime)));
  };

  const handleReallocateSubmit = (e) => {
    e.preventDefault();
    const booking = selectedBookingDetails;
    if (!booking) return;

    const [startHour, startMin] = reallocateStartTime.split(':').map(Number);
    const [endHour, endMin] = reallocateEndTime.split(':').map(Number);

    const startISO = `${reallocateDate}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`;
    const endISO = `${reallocateDate}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`;

    const formatTime12h = (hour, min) => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHr = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHr}:${String(min).padStart(2, '0')} ${ampm}`;
    };
    const timeSlotStr = `${formatTime12h(startHour, startMin)} - ${formatTime12h(endHour, endMin)}`;

    const updatedBooking = {
      ...booking,
      startTime: startISO,
      endTime: endISO,
      timeSlot: timeSlotStr,
      approvedBy: 'Admin Reallocated'
    };

    setRoomsList(prev => prev.map(r => {
      // Remove from old room
      if (r.id === booking.room && r.id !== reallocateRoomId) {
        return {
          ...r,
          status: r.currentBooking?.id === booking.id ? 'Available' : r.status,
          currentBooking: r.currentBooking?.id === booking.id ? null : r.currentBooking,
          bookings: r.bookings.filter(b => b.id !== booking.id)
        };
      }
      // Add or update in new room
      if (r.id === reallocateRoomId) {
        const alreadyHas = r.bookings.some(b => b.id === booking.id);
        if (alreadyHas) {
          return {
            ...r,
            currentBooking: r.currentBooking?.id === booking.id ? updatedBooking : r.currentBooking,
            bookings: r.bookings.map(b => b.id === booking.id ? updatedBooking : b)
          };
        } else {
          return {
            ...r,
            status: 'Booked',
            currentBooking: updatedBooking,
            bookings: [...(r.bookings || []), updatedBooking]
          };
        }
      }
      return r;
    }));

    setIsReallocating(false);
    setSelectedBookingDetails(null);
    triggerToast("Booking reallocated successfully.");
  };

  const handleUpdateStudentAttendance = (studentId, newStatus) => {
    const reason = window.prompt("Reason for manual override (e.g., Medical Certificate, OTP Timeout Error):", "Technical OTP Error");
    if (reason === null) return;
    
    const updaterName = user?.name || 'Admin';

    setRoomsList(prev => prev.map(r => {
      return {
        ...r,
        bookings: (r.bookings || []).map(b => {
          if (b.id === selectedBookingDetails.id) {
            const currentStudents = b.enrolledStudents || [
              { studentId: "student-1", name: "Adithya K", rollNumber: "21CS001", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" },
              { studentId: "student-2", name: "Keerthana S", rollNumber: "21CS045", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: false, attendanceStatus: "ABSENT", lastUpdatedBy: "System" },
              { studentId: "student-3", name: "Abhinav R", rollNumber: "22IT012", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PENDING", lastUpdatedBy: "System" },
              { studentId: "student-4", name: "Sneha P", rollNumber: "22IT098", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" }
            ];
            return {
              ...b,
              enrolledStudents: currentStudents.map(s => {
                if (s.studentId === studentId) {
                  return {
                    ...s,
                    attendanceStatus: newStatus,
                    lastUpdatedBy: `Manually Updated by ${updaterName} (${reason || 'No reason'})`
                  };
                }
                return s;
              })
            };
          }
          return b;
        })
      };
    }));

    setSelectedBookingDetails(prev => {
      const currentStudents = prev.enrolledStudents || [
        { studentId: "student-1", name: "Adithya K", rollNumber: "21CS001", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" },
        { studentId: "student-2", name: "Keerthana S", rollNumber: "21CS045", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: false, attendanceStatus: "ABSENT", lastUpdatedBy: "System" },
        { studentId: "student-3", name: "Abhinav R", rollNumber: "22IT012", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PENDING", lastUpdatedBy: "System" },
        { studentId: "student-4", name: "Sneha P", rollNumber: "22IT098", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" }
      ];
      return {
        ...prev,
        enrolledStudents: currentStudents.map(s => {
          if (s.studentId === studentId) {
            return {
              ...s,
              attendanceStatus: newStatus,
              lastUpdatedBy: `Manually Updated by ${updaterName} (${reason || 'No reason'})`
            };
          }
          return s;
        })
      };
    });

    triggerToast(`Attendance status updated manually for student.`);
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

    setRoomsList(prev => prev.map(r => {
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

    triggerToast(`Approved and enrolled ${request.name}!`);
  };

  const handleDeclineJoinRequest = (requestId) => {
    const booking = selectedBookingDetails;
    if (!booking) return;

    const declineReason = window.prompt("Enter decline reason (optional):", "No slots available / Session full");
    if (declineReason === null) return;

    setRoomsList(prev => prev.map(r => {
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

    triggerToast("Join request declined.");
  };

  const handleTrackClick = (e, row) => {
    // Prevent trigger if they click an existing booking block (since that opens details modal)
    if (e.target.closest('.absolute.h-\\[52px\\]')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timelineClickX = clickX - 160;
    if (timelineClickX < 0) return; // clicked the left label

    const clickedMinutes = Math.floor((timelineClickX / 1440) * 1440);
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
    setAllocationUser('');
    setAllocationPurpose('');
    setShowAllocationModal(true);
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocationTitle || !allocationUser || !allocationRoom) {
      triggerToast("Please fill in all required fields.");
      return;
    }

    const [startHour, startMin] = allocationStartTime.split(':').map(Number);
    const [endHour, endMin] = allocationEndTime.split(':').map(Number);

    const startISO = `${formatISODate(allocationDate)}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`;
    const endISO = `${formatISODate(allocationDate)}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`;

    try {
      await api.createBooking({
        eventName: allocationTitle,
        allocatedRoom: allocationRoom.id || allocationRoom._id,
        startTime: startISO,
        endTime: endISO,
        createdBy: allocationUser, // chosen faculty ID
        allowJoinRequests: true,
        reason: allocationPurpose
      });

      triggerToast("Session assigned and booked successfully!");
      setShowAllocationModal(false);
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      triggerToast(`Failed to allocate session: ${err.message}`);
    }
  };

  // Matrix filter rows calculations
  let rows = [];
  let selectedRoomObj = roomsList.find(r => r.id === selectedRoomId);

  if (viewMode === 'all') {
    const filteredRooms = roomsList.filter(room => {
      const matchesDept = deptFilter === 'All Departments' || room.department === deptFilter;
      const matchesBlock = blockFilter === 'All Blocks' || room.building === blockFilter;
      const matchesType = roomTypeFilter === 'All Types' || (room.type || 'CLASSROOM') === roomTypeFilter;
      return matchesDept && matchesBlock && matchesType;
    });

    rows = filteredRooms.map(room => {
      const dayBookings = (room.bookings || []).filter(b => isDateSameDay(b.startTime, selectedDate));
      return {
        id: room.id,
        name: room.name,
        roomObj: room,
        bookings: dayBookings
      };
    });
  } else {
    // 7-day single room view
    if (selectedRoomObj) {
      const weekDays = getWeekDays(selectedDate);
      rows = weekDays.map(day => {
        const dayBookings = (selectedRoomObj.bookings || []).filter(b => isDateSameDay(b.startTime, day));
        return {
          id: formatISODate(day),
          name: day.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
          date: day,
          bookings: dayBookings
        };
      });
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn text-left text-slate-800">
      
      {/* Scope & Filtering Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
        
        {/* Navigation & Date Picker */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToday}
            className="bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer select-none"
          >
            Today
          </button>
          
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-1 py-0.5">
            <button 
              onClick={handlePrev} 
              className="p-1 hover:bg-slate-100 rounded text-slate-650 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-slate-850 px-2 min-w-[120px] text-center select-none">
              {viewMode === 'all' 
                ? formatDisplayDate(selectedDate)
                : `Week of ${formatDisplayDate(getWeekDays(selectedDate)[0])}`
              }
            </span>
            <button 
              onClick={handleNext} 
              className="p-1 hover:bg-slate-100 rounded text-slate-650 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-350 rounded-xl px-2.5 py-1.5 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-blue-600 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="date"
              value={formatISODate(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
            <span className="text-[10px] font-black text-slate-700 select-none">Choose Date</span>
          </div>
        </div>

        {/* View Switcher Pill */}
        <div className="bg-slate-200/60 p-0.5 rounded-xl flex">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              viewMode === 'all' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Rooms View
          </button>
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              viewMode === 'single' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Single Room View
          </button>
        </div>

      </div>

      {/* Roster-based Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        {viewMode === 'all' ? (
          <>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Filter Institution Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500 text-slate-700"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Campus Block</label>
              <select
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500 text-slate-700"
              >
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Type Spec</label>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500 text-slate-700"
              >
                {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-end text-[10px] text-slate-400 font-bold pr-1 pt-4">
              <span>Admin system-wide scope.</span>
            </div>
          </>
        ) : (
          <div className="col-span-4">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Classroom Focus</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-slate-700"
            >
              {roomsList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.name} ({r.department})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 24-Hour Gantt Matrix Board */}
      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
        
        {/* Horizontal scroll grid */}
        <div ref={timelineScrollRef} className="overflow-x-auto w-full">
          <div className="w-[1600px] flex flex-col divide-y divide-slate-150">
            
            {/* Header row */}
            <div className="flex items-center h-12 bg-slate-50/80 sticky top-0 z-10">
              <div className="w-[160px] shrink-0 font-extrabold text-[10px] text-slate-455 text-slate-500 uppercase tracking-wider pl-4 border-r border-slate-200 bg-slate-100/90 h-full flex items-center select-none">
                {viewMode === 'all' ? 'Classroom Venue' : 'Timeline Date'}
              </div>
              
              {/* Hour Columns */}
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

            {/* Tracks */}
            {rows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-semibold w-full">
                No rooms match the selected filter configuration.
              </div>
            ) : (
              rows.map((row) => (
                <div 
                  key={row.id} 
                  onClick={(e) => handleTrackClick(e, row)}
                  title="Click empty timeline space to assign/schedule a session"
                  className="h-20 w-[1600px] relative flex bg-emerald-50/15 hover:bg-slate-50/40 transition-colors divide-x divide-slate-150/30 select-none cursor-crosshair"
                >
                  {/* Row Left Label */}
                  <div className="w-[160px] shrink-0 bg-white border-r border-slate-200 h-full flex flex-col justify-center px-4 font-bold select-none z-10">
                    <span className="text-xs text-slate-900 truncate leading-snug">{row.id}</span>
                    <span className="text-[9.5px] text-slate-450 truncate font-semibold mt-0.5">{row.name}</span>
                  </div>

                  {/* Hour slots filler */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="w-[60px] h-full shrink-0 border-r border-slate-200/20 pointer-events-none" />
                  ))}

                  {/* Booking Blocks Overlay */}
                  <div className="absolute inset-0 pl-[160px] pointer-events-auto">
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
                            e.stopPropagation();
                            setSelectedBookingDetails({ ...booking, room: viewMode === 'all' ? row.id : selectedRoomId });
                            setIsReallocating(false);
                            setShowRoster(false);
                          }}
                          className={`absolute h-[52px] top-[14px] rounded-xl border flex flex-col justify-center px-3 shadow-md cursor-pointer hover:scale-[1.01] hover:brightness-95 transition-all select-none overflow-hidden ${blockStyle}`}
                          style={{
                            left: `${startMinutes}px`,
                            width: `${Math.max(duration, 50)}px`
                          }}
                        >
                          <div className="text-[10px] font-black truncate leading-tight">
                            {booking.title || booking.purpose}
                          </div>
                          <div className="text-[8.5px] font-bold opacity-90 truncate mt-0.5 font-mono">
                            {booking.user || booking.facultyName} • {minutesToTimeString(startMinutes)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Legend Guide */}
      <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-500 select-none bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl max-w-max">
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-250 block"></span>
          <span>Available Time Space</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-blue-600 border border-blue-700 block"></span>
          <span>Approved Event</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-amber-500 border border-amber-600 block"></span>
          <span>Pending Request</span>
        </span>
      </div>

      {/* Admin Booking Details & Override Dialog */}
      {selectedBookingDetails && (() => {
        const studentsList = selectedBookingDetails.enrolledStudents || [
          { studentId: "student-1", name: "Adithya K", rollNumber: "21CS001", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" },
          { studentId: "student-2", name: "Keerthana S", rollNumber: "21CS045", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: false, attendanceStatus: "ABSENT", lastUpdatedBy: "System" },
          { studentId: "student-3", name: "Abhinav R", rollNumber: "22IT012", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PENDING", lastUpdatedBy: "System" },
          { studentId: "student-4", name: "Sneha P", rollNumber: "22IT098", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PRESENT", lastUpdatedBy: "System (OTP)" }
        ];
        const checkedInCount = studentsList.filter(s => s.attendanceStatus === 'PRESENT').length;

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn text-left text-slate-800 p-4">
            <div className={`bg-white border border-slate-200 rounded-2xl w-full shadow-2xl animate-scaleUp flex flex-col max-h-[90vh] transition-all duration-300 ${showRoster && !isReallocating ? 'max-w-3xl' : 'max-w-sm'}`}>

              {/* ── Sticky Modal Header ── */}
              <div className="flex justify-between items-start px-6 pt-5 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl shrink-0">
                <div>
                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                    selectedBookingDetails.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    selectedBookingDetails.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {selectedBookingDetails.status}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 mt-2 leading-snug max-w-xs">
                    {selectedBookingDetails.title || selectedBookingDetails.purpose}
                  </h4>
                </div>
                <button
                  onClick={() => { setSelectedBookingDetails(null); setIsReallocating(false); setShowRoster(false); }}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors shrink-0 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {!isReallocating ? (
                  <>
                    {/* Core booking info */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-0.5">
                        <span className="font-bold text-slate-400">Classroom Block</span>
                        <span className="font-extrabold text-slate-800">{selectedBookingDetails.room}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="font-bold text-slate-400">Assigned Time</span>
                        <span className="font-extrabold text-slate-800">{selectedBookingDetails.timeSlot}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="font-bold text-slate-400">Faculty/User</span>
                        <span className="font-extrabold text-[#0052cc]">{selectedBookingDetails.user || selectedBookingDetails.facultyName}</span>
                      </div>
                      {selectedBookingDetails.purpose && (
                        <div className="flex flex-col space-y-0.5 pt-1.5 border-t border-slate-100">
                          <span className="font-bold text-slate-400">Event Purpose</span>
                          <span className="font-medium text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {selectedBookingDetails.purpose}
                          </span>
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
                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                              <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="p-2 pl-3">Student Profile</th>
                                    <th className="p-2">Roll Number</th>
                                    <th className="p-2">Academic Details</th>
                                    <th className="p-2">Survey Status</th>
                                    <th className="p-2">Attendance Status</th>
                                    <th className="p-2 pr-3 text-right">Actions</th>
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
                                      const deptAbbr = std.department ? (std.department.toLowerCase().includes('computer') ? 'CSE' : std.department.toLowerCase().includes('information') ? 'IT' : std.department.toLowerCase().includes('mechanical') ? 'ME' : std.department.toLowerCase().includes('electrical') ? 'EEE' : std.department) : '';
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
                                              {std.surveyCompleted ? 'Survey Completed' : 'Survey Pending'}
                                            </span>
                                          </td>
                                          <td className="p-2">
                                            <div className="flex flex-col space-y-0.5">
                                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border inline-flex items-center space-x-1 max-w-max uppercase ${
                                                std.attendanceStatus === 'PRESENT' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                                std.attendanceStatus === 'ABSENT' ? 'bg-red-50 text-red-800 border-red-200' :
                                                'bg-amber-50 text-amber-800 border-amber-200'
                                              }`}>
                                                {std.attendanceStatus === 'PRESENT' && <span className="mr-1">✓</span>}
                                                {std.attendanceStatus === 'ABSENT' && <span className="mr-1">✗</span>}
                                                <span>{std.attendanceStatus}</span>
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
                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white animate-fadeIn">
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

                    {/* ADMIN OVERRIDE CONTROL BOARD */}
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-2">
                      <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Administrative Action Overrides</span>
                      </span>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {selectedBookingDetails.status === 'Pending' && (
                          <button
                            onClick={() => handleForceApprove(selectedBookingDetails.id, selectedBookingDetails.room)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] py-2 px-3 rounded-lg uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Force Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleAdminCancel(selectedBookingDetails.id, selectedBookingDetails.room)}
                          className={`text-white font-bold text-[9px] py-2 px-3 rounded-lg uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-colors bg-red-600 hover:bg-red-700 ${
                            selectedBookingDetails.status !== 'Pending' ? 'col-span-2' : ''
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Admin Cancel</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenReallocate(selectedBookingDetails)}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[9px] py-2 rounded-lg uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-colors mt-2"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reallocate Booking</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* REALLOCATION FORM SUB-VIEW */
                  <form onSubmit={handleReallocateSubmit} className="space-y-4 animate-fadeIn">
                    <span className="text-[9.5px] font-black text-blue-700 uppercase tracking-widest block">
                      Assign New Venue & Time Slot
                    </span>

                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Room Venue</label>
                      <select
                        value={reallocateRoomId}
                        onChange={(e) => setReallocateRoomId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-semibold"
                      >
                        {roomsList.map(r => (
                          <option key={r.id} value={r.id}>{r.id} - {r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Date</label>
                      <input
                        type="date"
                        value={reallocateDate}
                        onChange={(e) => setReallocateDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-semibold font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Start Time</label>
                        <input
                          type="time"
                          value={reallocateStartTime}
                          onChange={(e) => setReallocateStartTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-semibold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">End Time</label>
                        <input
                          type="time"
                          value={reallocateEndTime}
                          onChange={(e) => setReallocateEndTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-semibold font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsReallocating(false)}
                        className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider shadow-lg shadow-blue-500/10 cursor-pointer"
                      >
                        Reallocate
                      </button>
                    </div>
                  </form>
                )}
              </div>{/* end scrollable body */}

            </div>
          </div>
        );
      })()}

      {/* Admin Allocation/Assignment Modal */}
      {showAllocationModal && allocationRoom && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn text-left text-slate-800 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl animate-scaleUp flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[8.5px] font-black px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-800 uppercase tracking-wider">
                  Administrative Assignment
                </span>
                <h4 className="text-xs font-black text-slate-900 mt-2 leading-snug">
                  Assign Session at {allocationRoom.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAllocationModal(false)}
                className="text-slate-400 hover:text-slate-655 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAllocateSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Venue</label>
                <input
                  type="text"
                  disabled
                  value={`${allocationRoom.id} - ${allocationRoom.name}`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Date</label>
                <input
                  type="text"
                  disabled
                  value={formatDisplayDate(allocationDate)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={allocationStartTime}
                    onChange={(e) => setAllocationStartTime(e.target.value)}
                    className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={allocationEndTime}
                    onChange={(e) => setAllocationEndTime(e.target.value)}
                    className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Faculty Assignee *</label>
                <select
                  required
                  value={allocationUser}
                  onChange={(e) => setAllocationUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Faculty --</option>
                  {(usersList || []).filter(u => u.role === 'faculty').map(f => (
                    <option key={f.id || f._id} value={f.id || f._id}>
                      {f.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Session Title / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guest Lecture: Advanced IoT Architectures"
                  value={allocationTitle}
                  onChange={(e) => setAllocationTitle(e.target.value)}
                  className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Session Purpose / Reason</label>
                <textarea
                  rows={2}
                  placeholder="Type any details or scheduling justification..."
                  value={allocationPurpose}
                  onChange={(e) => setAllocationPurpose(e.target.value)}
                  className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Assign Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GlobalBookingsMatrix;
