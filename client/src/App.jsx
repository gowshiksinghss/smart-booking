import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Student Page Modules
import StudentLayout from './pages/student/StudentLayout';
import StudentOverview from './pages/student/StudentOverview';
import FindRooms from './pages/student/FindRooms';
import MyBookings from './pages/student/MyBookings';
import AttendanceCheckIn from './pages/student/AttendanceCheckIn';

// Faculty Page Modules
import FacultyLayout from './pages/faculty/FacultyLayout';
import FacultyOverview from './pages/faculty/FacultyOverview';
import InitiateBooking from './pages/faculty/InitiateBooking';
import Broadcasts from './pages/faculty/Broadcasts';
import LiveOtpSession from './pages/faculty/LiveOtpSession';

// Department Staff Page Modules
import StaffLayout from './pages/staff/StaffLayout';
import StaffOverview from './pages/staff/StaffOverview';
import ApprovalQueue from './pages/staff/ApprovalQueue';
import RoomMatrix from './pages/staff/RoomMatrix';
import Announcements from './pages/staff/Announcements';
import StaffOtpSession from './pages/staff/StaffOtpSession';

// Admin Page Modules
import AdminLayout from './pages/admin/AdminLayout';
import UserGovernance from './pages/admin/UserGovernance';
import AdminRoomsLayout from './pages/admin/AdminRoomsLayout';
import AdminBroadcasts from './pages/admin/AdminBroadcasts';
import AnalyticsExport from './pages/admin/AnalyticsExport';
import SystemSettings from './pages/admin/SystemSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Student Portal Sub-routing */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentOverview />} />
            <Route path="find" element={<FindRooms />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="attendance" element={<AttendanceCheckIn />} />
          </Route>

          {/* Protected Faculty Portal Sub-routing */}
          <Route 
            path="/faculty" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FacultyOverview />} />
            <Route path="request" element={<InitiateBooking />} />
            <Route path="broadcast" element={<Broadcasts />} />
            <Route path="session" element={<LiveOtpSession />} />
          </Route>

          {/* Protected Department Staff Portal Sub-routing */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StaffOverview />} />
            <Route path="approvals" element={<ApprovalQueue />} />
            <Route path="matrix" element={<RoomMatrix />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="otp" element={<StaffOtpSession />} />
          </Route>

          {/* Protected Admin Portal Sub-routing */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UserGovernance />} />
            <Route path="rooms" element={<AdminRoomsLayout />} />
            <Route path="broadcast" element={<AdminBroadcasts />} />
            <Route path="export" element={<AnalyticsExport />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
