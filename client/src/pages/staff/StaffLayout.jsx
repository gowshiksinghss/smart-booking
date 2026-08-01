import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api } from '../../utils/api';

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab syncing
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'dashboard';

  const setActiveTab = (tabId) => {
    navigate(`/staff/${tabId}`);
  };

  // State Management
  const [rooms, setRooms] = useState([]);
  const [bookingQueue, setBookingQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [notificationList, setNotificationList] = useState([]);
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

  // Live Session / OTP Generator States for Staff
  const [otpGenerated, setOtpGenerated] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 mins
  const [isOtpActive, setIsOtpActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const refreshData = async () => {
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
      setBookingQueue(mappedBookings);

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
          bookings: roomBookings,
          currentBooking: roomBookings.find(b => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return b.status === 'Approved' && now >= start && now <= end;
          }) || null
        };
      });
      setRooms(mappedRooms);

      const notifs = await api.getNotifications();
      setNotificationList(notifs);
    } catch (error) {
      console.error("Error refreshing staff layout data:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handle OTP timer countdown
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
    return () => clearInterval(timerInterval);
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
      triggerToast("Live OTP generated for Staff session!");
      refreshData();
    } catch (err) {
      triggerToast(`Error: ${err.message}`);
    }
  };

  // Handle Approvals
  const handleApprove = async (id) => {
    try {
      await api.updateBookingStatus(id, 'APPROVED');
      triggerToast("Booking approved successfully!");
      refreshData();
    } catch (err) {
      triggerToast(`Error: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.updateBookingStatus(id, 'REJECTED');
      triggerToast("Booking rejected successfully!");
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
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Welcome, Subramanian M</span>
              <span className="text-[10px] bg-[#deebff] text-[#0747a6] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                Department Staff Portal
              </span>
            </h2>
            <p className="text-xs text-slate-550 mt-1">
              Authorize faculty initiative requests, inspect room allocation matrices, and monitor departmental resources.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center space-x-2 max-w-sm font-bold">
            <span className="bg-[#0052cc] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              CS DEPT
            </span>
            <span>Academic Year: 2026-27</span>
          </div>
        </div>
      </div>

      {/* Main Layout Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto">
        <Outlet context={{
          rooms, setRooms,
          bookingQueue, setBookingQueue,
          reports, setReports,
          notificationList, setNotificationList,
          surveys, setSurveys,
          handleApprove, handleReject,
          otpGenerated, setOtpGenerated,
          otpTimer, setOtpTimer,
          isOtpActive, setIsOtpActive,
          triggerToast, handleGenerateOtp
        }} />
      </main>
    </div>
  );
};

export default StaffLayout;
