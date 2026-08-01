import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { api } from '../../utils/api';
import { 
  X, MapPin, Info, ClipboardList, KeyRound, Timer, ShieldAlert, Check, ShieldCheck, Users
} from 'lucide-react';

const StudentLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab syncing
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'dashboard';

  const setActiveTab = (tabId) => {
    navigate(`/student/${tabId}`);
  };

  // State shared via Outlet Context
  const [bookingInitiatives, setBookingInitiatives] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [rooms, setRooms] = useState([]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const roomsData = await api.getRooms();
      const bookingsData = await api.getBookings();

      const mappedInitiatives = bookingsData.map(b => ({
        ...b,
        id: b._id,
        title: b.eventName,
        room: b.allocatedRoom ? b.allocatedRoom.name : 'Unknown Room',
        roomId: b.allocatedRoom ? b.allocatedRoom._id : '',
        building: b.allocatedRoom ? b.allocatedRoom.block : 'Main Block',
        timeSlot: `${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        date: new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        facultyName: b.createdBy ? b.createdBy.name : 'Faculty Member',
        facultyEmail: b.createdBy ? b.createdBy.email : '',
        status: b.status === 'PENDING_STAFF_APPROVAL' ? 'Pending' : b.status === 'APPROVED' ? 'Approved' : b.status === 'REJECTED' ? 'Rejected' : b.status
      }));
      setBookingInitiatives(mappedInitiatives);

      const now = new Date();
      const mappedRooms = roomsData.map(r => {
        // Find if this room has an ongoing approved booking
        const hasActiveBooking = bookingsData.some(b => {
          const isApproved = b.status === 'APPROVED';
          const rId = b.allocatedRoom ? (b.allocatedRoom._id || b.allocatedRoom) : '';
          if (rId.toString() !== r._id.toString()) return false;
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          return isApproved && now >= start && now <= end;
        });

        // Find all bookings for this room to associate them
        const roomBookings = mappedInitiatives.filter(b => b.roomId.toString() === r._id.toString());

        return {
          ...r,
          id: r._id,
          name: r.name,
          building: r.block,
          floor: r.floor || 'Floor 1',
          capacity: r.capacity || 60,
          type: r.roomType === 'lab' ? 'RESEARCH LAB' : r.roomType === 'seminar_hall' ? 'SEMINAR HALL' : 'CLASSROOM',
          image: r.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
          status: r.status === 'Maintenance' ? 'Maintenance' : (hasActiveBooking ? 'Booked' : 'Available'),
          bookings: roomBookings
        };
      });
      setRooms(mappedRooms);

      const roll = user.rollNumber || user.rollNo || "21CS001";
      const studentB = bookingsData
        .filter(b => (b.enrolledStudents || []).some(s => s.rollNumber === roll))
        .map(b => ({
          id: b._id,
          title: b.eventName,
          room: b.allocatedRoom ? b.allocatedRoom.name : "Unknown Room",
          building: b.allocatedRoom ? b.allocatedRoom.block : "Main Block",
          date: new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dateFull: new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: `${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: b.status === 'PENDING_STAFF_APPROVAL' ? 'Pending' : b.status === 'APPROVED' ? 'Approved' : b.status,
          membersCount: (b.enrolledStudents || []).length,
          purpose: b.reason || 'Academic Session',
          rawBooking: b
        }));
      setBookings(studentB);

      // Build attendance logs
      const history = [];
      for (const b of bookingsData) {
        if (b.status === 'APPROVED') {
          try {
            const logs = await api.getSessionAttendance(b._id);
            const myLog = logs.find(log => log.studentId && log.studentId.rollNumber === roll);
            history.push({
              id: b._id,
              title: `${b.allocatedRoom ? b.allocatedRoom.name : 'Room'} - ${b.eventName}`,
              date: `${new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              status: myLog ? myLog.attendanceStatus : 'PENDING',
              rawBooking: b
            });
          } catch (e) {
            history.push({
              id: b._id,
              title: `${b.allocatedRoom ? b.allocatedRoom.name : 'Room'} - ${b.eventName}`,
              date: `${new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              status: 'PENDING',
              rawBooking: b
            });
          }
        }
      }
      setAttendanceHistory(history);
    } catch (error) {
      console.error("Error refreshing student data:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);



  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [selectedFloor, setSelectedFloor] = useState('Any Floor');
  const [selectedCapacity, setSelectedCapacity] = useState('Any Size');
  const [selectedTime, setSelectedTime] = useState('Now');

  // Modals state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [bookingDetailModal, setBookingDetailModal] = useState(null);

  // OTP Modal workflow state
  const [otpStep, setOtpStep] = useState(1); // 1: Pre-Survey, 2: OTP, 3: Success
  const [q1Rating, setQ1Rating] = useState(0);
  const [q2Choice, setQ2Choice] = useState('');
  const [surveyError, setSurveyError] = useState('');
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [timerSecs, setTimerSecs] = useState(300);
  const [otpError, setOtpError] = useState('');

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Timer effect for OTP
  useEffect(() => {
    let interval = null;
    if (showOtpModal && otpStep === 2 && timerSecs > 0) {
      interval = setInterval(() => {
        setTimerSecs((prev) => prev - 1);
      }, 1000);
    } else if (timerSecs === 0) {
      setOtpError("OTP expired. Please try again.");
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpStep, timerSecs]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const [joinRequestReason, setJoinRequestReason] = useState('');

  const getStudentEligibility = (booking, student) => {
    if (!booking || !student) return { visible: false, status: 'none' };

    const roll = student.rollNo || student.rollNumber;
    const dept = student.department;

    // Check if enrolled directly
    const isEnrolled = (booking.enrolledStudents || []).some(s => s.rollNumber === roll);
    if (isEnrolled) {
      return { visible: true, status: 'ENROLLED' };
    }

    // Check if join request is already submitted
    const existingReq = (booking.joinRequests || []).find(r => r.rollNumber === roll);
    if (existingReq) {
      return { visible: true, status: 'REQUEST_SUBMITTED', requestStatus: existingReq.status };
    }

    // Check target audience match
    const audience = booking.targetAudience || {};
    const matchesDept = !booking.targetDepartment || booking.targetDepartment === dept;
    const allowedRolls = audience.allowedRollNumbers || [];
    
    const isRollAllowed = audience.type === 'department' || allowedRolls.length === 0 || allowedRolls.includes(roll);

    if (matchesDept && isRollAllowed) {
      return { visible: true, status: 'ELIGIBLE_ENROLL' };
    }

    // Check if join requests allowed
    if (booking.allowJoinRequests) {
      const requestors = booking.eligibleRequestors || 'Open to All Departments';
      const matchesRequestorDept = requestors === 'Open to All Departments' || requestors === dept;
      if (matchesRequestorDept) {
        return { visible: true, status: 'ELIGIBLE_REQUEST' };
      }
    }

    return { visible: false, status: 'INELIGIBLE' };
  };

  const handleEnrollDirectly = (bookingId) => {
    setBookingInitiatives(prev => prev.map(b => {
      if (b.id === bookingId) {
        const studentObj = {
          studentId: user.id || `student-${Date.now()}`,
          name: user.name,
          rollNumber: user.rollNo || user.rollNumber,
          department: user.department,
          year: user.year,
          semester: user.semester,
          surveyCompleted: false,
          attendanceStatus: 'PENDING',
          lastUpdatedBy: 'Self (Enrolled)'
        };
        return {
          ...b,
          enrolledStudents: [...(b.enrolledStudents || []), studentObj]
        };
      }
      return b;
    }));
    triggerToast("Successfully joined the session!");
    setBookingDetailModal(null);
  };

  const handleJoinRequestSubmit = (bookingId) => {
    if (!joinRequestReason.trim()) return;

    setBookingInitiatives(prev => prev.map(b => {
      if (b.id === bookingId) {
        const requestObj = {
          requestId: `req-${Date.now()}`,
          studentId: user.id || `student-${Date.now()}`,
          name: user.name,
          rollNumber: user.rollNo || user.rollNumber,
          department: user.department,
          year: user.year,
          semester: user.semester,
          reasonNote: joinRequestReason,
          status: 'PENDING',
          avatar: user.avatar
        };
        return {
          ...b,
          joinRequests: [...(b.joinRequests || []), requestObj]
        };
      }
      return b;
    }));
    triggerToast("Join request submitted successfully!");
    setJoinRequestReason('');
    setBookingDetailModal(null);
  };

  const handleBookingConfirm = () => {
    if (!selectedRoomForBooking) return;
    
    const newBookingId = `init-${Date.now()}`;
    const newBooking = {
      id: newBookingId,
      title: selectedRoomForBooking.type === 'RESEARCH LAB' ? 'Advanced AI Lab Session' : 'Lecture Study Session',
      facultyName: "Dr. Sarah Chen",
      facultyEmail: "sarahchen@bitsathy.ac.in",
      room: selectedRoomForBooking.name,
      building: selectedRoomForBooking.building,
      date: "2026-08-01",
      timeSlot: selectedRoomForBooking.hours,
      startTime: "2026-08-01T10:00:00",
      endTime: "2026-08-01T12:00:00",
      department: user.department,
      targetDepartment: user.department,
      rollNumberTags: user.rollNo,
      status: "Approved",
      conflict: false,
      reason: "Self-study and lab validation session.",
      targetAudience: {
        type: "department",
        allowedRollNumbers: [user.rollNo]
      },
      allowJoinRequests: false,
      joinRequests: [],
      enrolledStudents: [
        {
          studentId: user.id || `student-${Date.now()}`,
          name: user.name,
          rollNumber: user.rollNo || user.rollNumber,
          department: user.department,
          year: user.year,
          semester: user.semester,
          surveyCompleted: false,
          attendanceStatus: 'PENDING',
          lastUpdatedBy: 'Self (Enrolled)'
        }
      ]
    };

    setBookingInitiatives([newBooking, ...bookingInitiatives]);
    setRooms(prev => prev.map(r => r.id === selectedRoomForBooking.id ? { ...r, status: 'Booked', bookedByStudent: true } : r));
    setSelectedRoomForBooking(null);
    triggerToast(`Room Room ${selectedRoomForBooking.name} booked successfully!`);
    navigate('/student/bookings');
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    if (q1Rating === 0 || !q2Choice) {
      setSurveyError("Please answer both questions to unlock the OTP verification field.");
      return;
    }
    setSurveyError('');
    setOtpStep(2);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpVal];
    newOtp[index] = value.substring(value.length - 1);
    setOtpVal(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpVerify = () => {
    const code = otpVal.join('');
    if (code.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    if (code !== "849201") {
      setOtpError("Invalid OTP entered. Please check again.");
      return;
    }

    setOtpError('');
    setOtpStep(3);

    setTimeout(() => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + " • " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setAttendanceHistory(prev => {
        const hasPending = prev.some(item => item.status === 'PENDING');
        if (hasPending) {
          return prev.map(item => item.status === 'PENDING' ? { ...item, status: 'PRESENT', date: formattedDate } : item);
        } else {
          const newRecord = {
            id: `a-${Date.now()}`,
            title: "Lab 402 - AI Session",
            date: formattedDate,
            status: "PRESENT"
          };
          return [newRecord, ...prev];
        }
      });
      setShowOtpModal(false);
      setOtpStep(1);
      setQ1Rating(0);
      setQ2Choice('');
      setOtpVal(['', '', '', '', '', '']);
      setTimerSecs(300);
      triggerToast("Attendance verified successfully!");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 z-50 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto">
        <Outlet context={{
          bookingInitiatives, setBookingInitiatives,
          bookings, setBookings,
          attendanceHistory, setAttendanceHistory,
          rooms, setRooms,
          searchQuery, setSearchQuery,
          selectedBuilding, setSelectedBuilding,
          selectedFloor, setSelectedFloor,
          selectedCapacity, setSelectedCapacity,
          selectedTime, setSelectedTime,
          selectedRoomForBooking, setSelectedRoomForBooking,
          showOtpModal, setShowOtpModal,
          bookingDetailModal, setBookingDetailModal,
          triggerToast
        }} />
      </main>

      {/* Booking Details Confirmation Modal */}
      {(selectedRoomForBooking || bookingDetailModal) && (() => {
        const isBookingMode = !!selectedRoomForBooking;
        const details = selectedRoomForBooking || bookingDetailModal;
        
        // Find if this is a booking initiative
        const isInitiative = !isBookingMode && !!details.id && details.id.startsWith('init-');
        
        // Compute eligibility if it is a booking initiative
        let eligibility = { visible: true, status: 'none' };
        if (isInitiative) {
          eligibility = getStudentEligibility(details, user);
        }

        const roomName = details.room ? (details.room.startsWith('Room') ? details.room : `Room ${details.room}`) : `Room ${details.name}`;
        const displayTitle = details.title || (details.type === 'RESEARCH LAB' ? 'Advanced AI Lab Session' : 'Lecture Study Session');
        const displayHours = details.timeSlot || details.hours || "10:00 - 12:00";
        const displayPurpose = details.reason || details.purpose || "Self-study and lab validation session.";
        const displayCoordinator = details.facultyName || details.coordinator || "Dr. Sarah Chen";
        const coordinatorInitials = details.coordinatorInitials || (displayCoordinator.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn flex flex-col justify-between text-slate-800">
              
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  {isBookingMode ? "Booking Confirmation" : "Session Details"}
                </h3>
                <button 
                  onClick={() => {
                    setSelectedRoomForBooking(null);
                    setBookingDetailModal(null);
                    setJoinRequestReason('');
                  }}
                  className="text-slate-400 hover:text-slate-650 font-bold p-1 cursor-pointer rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="h-32 rounded-xl overflow-hidden relative border border-slate-150 shrink-0">
                  <img 
                    src={details.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[8px] bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                    {details.type || "CLASSROOM"}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#0052cc] leading-tight">
                    {displayTitle}
                  </h4>
                  <p className="text-[10px] text-slate-450 font-bold flex items-center space-x-1 mt-1 uppercase tracking-wider">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{roomName} • {details.building} Block</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-slate-700">
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">DATE</span>
                    <span>📅 Aug 01, 2026</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">HOURS</span>
                    <span className="truncate block font-bold text-[11px]">{displayHours}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">SESSION PURPOSE</span>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-650 flex items-start space-x-2 leading-relaxed">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{displayPurpose}</span>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">FACULTY SUPERVISOR</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#ffebec] text-[#de350b] flex items-center justify-center text-[10px] font-black border border-[#ffbdad] shrink-0">
                      {coordinatorInitials}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {displayCoordinator}
                    </span>
                  </div>
                </div>

                {/* Join Request/Enrollment controls */}
                {isInitiative && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    {eligibility.status === 'ENROLLED' && (
                      <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>You are enrolled in this initiative.</span>
                      </div>
                    )}

                    {eligibility.status === 'REQUEST_SUBMITTED' && (
                      <div className="bg-amber-50 border border-amber-250 p-3 rounded-xl text-xs text-amber-800 font-bold space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Join Request Status: {eligibility.requestStatus}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold italic">
                          "{(details.joinRequests || []).find(r => r.rollNumber === user?.rollNo)?.reasonNote || ''}"
                        </p>
                      </div>
                    )}

                    {eligibility.status === 'ELIGIBLE_REQUEST' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Request Reason / Note
                        </label>
                        <textarea
                          rows={2}
                          value={joinRequestReason}
                          onChange={(e) => setJoinRequestReason(e.target.value)}
                          placeholder="Explain why you need to join this session..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 resize-none font-semibold"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
                {isBookingMode ? (
                  <button
                    onClick={handleBookingConfirm}
                    className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white text-xs font-bold py-3 rounded-2xl shadow transition-colors flex items-center justify-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <span>Confirm Reservation →</span>
                  </button>
                ) : isInitiative ? (
                  <div>
                    {eligibility.status === 'ELIGIBLE_ENROLL' && (
                      <button
                        onClick={() => handleEnrollDirectly(details.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-2xl shadow transition-colors cursor-pointer uppercase tracking-wider text-center"
                      >
                        <span>Join Session</span>
                      </button>
                    )}

                    {eligibility.status === 'ELIGIBLE_REQUEST' && (
                      <button
                        onClick={() => handleJoinRequestSubmit(details.id)}
                        disabled={!joinRequestReason.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-2xl shadow transition-colors cursor-pointer uppercase tracking-wider text-center"
                      >
                        <span>Request to Join</span>
                      </button>
                    )}

                    {(eligibility.status === 'ENROLLED' || eligibility.status === 'REQUEST_SUBMITTED') && (
                      <button
                        onClick={() => {
                          setBookingDetailModal(null);
                          setJoinRequestReason('');
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-2xl shadow transition-colors cursor-pointer uppercase tracking-wider text-center"
                      >
                        <span>Close Window</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setBookingDetailModal(null)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-2xl shadow transition-colors cursor-pointer uppercase tracking-wider text-center"
                  >
                    <span>Close Window</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* OTP Verification & Survey Flow Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn flex flex-col justify-between text-slate-800">
            
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xs font-extrabold text-[#0052cc] uppercase tracking-wider">Verification checkin</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ROOM: LAB 402 • DR. CHEN</p>
              </div>
              <button 
                onClick={() => setShowOtpModal(false)}
                className="text-slate-450 hover:text-slate-750 font-bold p-1 cursor-pointer rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              
              <div className="flex items-center justify-center space-x-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full ${
                  otpStep === 1 ? 'bg-blue-50 text-blue-700 border border-blue-150' : 'bg-slate-100 text-slate-500'
                }`}>
                  <ClipboardList className="w-3 h-3" />
                  <span>1. SURVEY GATE</span>
                </div>
                <div className="w-4 border-t border-slate-200"></div>
                <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full ${
                  otpStep === 2 ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-slate-100 text-slate-500'
                }`}>
                  <KeyRound className="w-3 h-3" />
                  <span>2. OTP TOKEN</span>
                </div>
              </div>

              {/* Step 1: Survey Gate */}
              {otpStep === 1 && (
                <form onSubmit={handleSurveySubmit} className="space-y-4">
                  <div className="bg-[#deebff] border border-blue-150 p-3 rounded-xl flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#0747a6] leading-relaxed font-semibold">
                      Please submit the resource feedback survey regarding today's session to unlock the OTP verification screen.
                    </p>
                  </div>

                  {surveyError && (
                    <p className="text-[10px] text-red-500 font-extrabold flex items-center space-x-1">
                      <span>●</span> <span>{surveyError}</span>
                    </p>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Rate the AV presentation quality in Lab 402:
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setQ1Rating(num)}
                          className={`w-8 h-8 rounded-lg font-black text-xs border transition-all cursor-pointer ${
                            q1Rating === num
                              ? 'bg-[#0052cc] border-[#0747a6] text-white'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Was the air conditioning functional?
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-650">
                      {["Yes, perfect", "It was too cold", "Not cooling", "Broken"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setQ2Choice(opt)}
                          className={`p-2 rounded-lg text-left border cursor-pointer transition-all ${
                            q2Choice === opt
                              ? 'bg-blue-50 border-[#0052cc] text-[#0052cc] font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white text-xs font-extrabold py-3 rounded-2xl shadow transition-all cursor-pointer uppercase tracking-widest mt-2"
                  >
                    Submit & Unlock OTP
                  </button>
                </form>
              )}

              {/* Step 2: OTP token verification */}
              {otpStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs">
                    <span className="text-slate-500 font-bold">OTP EXPIRY SESSION:</span>
                    <span className="font-mono font-black text-[#0052cc] flex items-center space-x-1">
                      <Timer className="w-3.5 h-3.5 inline" />
                      <span>{Math.floor(timerSecs / 60)}:{(timerSecs % 60).toString().padStart(2, '0')}</span>
                    </span>
                  </div>

                  {otpError && (
                    <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl text-[10px] text-red-700 font-bold flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 text-center uppercase tracking-wide">
                      Enter 6-Digit Class Code
                    </label>
                    <div className="flex items-center justify-center space-x-2">
                      {otpVal.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otpVal[idx] && idx > 0) {
                              document.getElementById(`otp-${idx - 1}`)?.focus();
                            }
                          }}
                          className="w-9 h-10 text-center text-sm font-black border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none text-[#0747a6] bg-slate-50"
                        />
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 text-center font-bold">
                      (Class OTP Code is <span className="font-mono text-[#0052cc]">849201</span>)
                    </p>
                  </div>

                  <button
                    onClick={handleOtpVerify}
                    className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white text-xs font-extrabold py-3 rounded-2xl shadow transition-all cursor-pointer uppercase tracking-widest mt-2"
                  >
                    Verify Attendance
                  </button>
                </div>
              )}

              {/* Step 3: Checkin Success */}
              {otpStep === 3 && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Attendance Logged Successfully!</h4>
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">Your presentation log has been updated in the academic system.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;
