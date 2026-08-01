import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

const FacultyLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab syncing
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'dashboard';

  const setActiveTab = (tabId) => {
    navigate(`/faculty/${tabId}`);
  };

  // State Management shared via Outlet Context
  const [bookingList, setBookingList] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [notificationList, setNotificationList] = useState([]);
  
  // Surveys state
  const [surveys, setSurveys] = useState([
    {
      id: 'survey-1',
      title: 'Resource Feedback Survey',
      questions: [
        { id: 'q-1', text: 'Rate the AV presentation quality in Lab 402:', type: 'rating' },
        { id: 'q-2', text: 'Was the air conditioning functional?', type: 'choice', options: ['Yes, perfect', 'Too cold', 'Not cooling', 'Broken'] }
      ]
    },
    {
      id: 'survey-2',
      title: 'Session Material Feedback',
      questions: [
        { id: 'q-1', text: 'Rate the complexity of today\'s lab exercises:', type: 'rating' },
        { id: 'q-2', text: 'Did you complete the tasks?', type: 'choice', options: ['Yes, fully', 'Partially', 'No'] }
      ]
    }
  ]);

  // Live Session / OTP Generator States
  const [otpGenerated, setOtpGenerated] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 mins
  const [isOtpActive, setIsOtpActive] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [attachedSurvey, setAttachedSurvey] = useState('survey-1');

  // Success Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const refreshData = async () => {
    if (!user) return;
    try {
      const roomsData = await api.getRooms();
      const bookingsData = await api.getBookings();

      const mappedBookings = bookingsData.map(b => ({
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
      setBookingList(mappedBookings);

      const now = new Date();
      const mappedRooms = roomsData.map(r => {
        const hasActiveBooking = bookingsData.some(b => {
          const isApproved = b.status === 'APPROVED';
          const rId = b.allocatedRoom ? (b.allocatedRoom._id || b.allocatedRoom) : '';
          if (rId.toString() !== r._id.toString()) return false;
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          return isApproved && now >= start && now <= end;
        });

        const roomBookings = mappedBookings.filter(b => b.roomId.toString() === r._id.toString());

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

      const notifs = await api.getNotifications();
      setNotificationList(notifs);
    } catch (error) {
      console.error("Error refreshing faculty layout data:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Handle OTP timer
  useEffect(() => {
    let timerInterval = null;

    if (isOtpActive) {
      timerInterval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setIsOtpActive(false);
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [isOtpActive]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleGenerateOtp = async (bookingId) => {
    try {
      const data = await api.generateOtp(bookingId);
      setOtpGenerated(data.otpCode);
      setOtpTimer(300);
      setIsOtpActive(true);
      
      // Load current attendance count
      const attendance = await api.getSessionAttendance(bookingId);
      const presentCount = attendance.filter(log => log.attendanceStatus === 'PRESENT').length;
      setAttendanceCount(presentCount);

      triggerToast("Live OTP generated and broadcasted!");
      refreshData();
    } catch (err) {
      triggerToast(`Error: ${err.message}`);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Main Layout Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto">
        <Outlet context={{
          bookingList, setBookingList,
          rooms, setRooms,
          notificationList, setNotificationList,
          surveys, setSurveys,
          otpGenerated, setOtpGenerated,
          otpTimer, setOtpTimer,
          isOtpActive, setIsOtpActive,
          attendanceCount, setAttendanceCount,
          attachedSurvey, setAttachedSurvey,
          triggerToast, handleGenerateOtp,
          refreshData
        }} />
      </main>
    </div>
  );
};

export default FacultyLayout;
