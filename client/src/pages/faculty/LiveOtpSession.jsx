import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Radio, RefreshCw, Timer, AlertTriangle, Users, BookOpen, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const getDeptAbbr = (dept = '') => {
  if (dept.toLowerCase().includes('computer')) return 'CSE';
  if (dept.toLowerCase().includes('information')) return 'IT';
  if (dept.toLowerCase().includes('mechanical')) return 'ME';
  if (dept.toLowerCase().includes('electrical')) return 'EEE';
  return dept;
};

const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const StatusBadge = ({ status }) => {
  const configs = {
    PRESENT:     { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: '✓ Present' },
    ABSENT:      { cls: 'bg-red-50 text-red-800 border-red-200',             label: '✗ Absent'  },
    PENDING:     { cls: 'bg-amber-50 text-amber-800 border-amber-200',       label: '⏳ Pending' },
  };
  const cfg = configs[status] || configs.PENDING;
  return (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const LiveOtpSession = () => {
  const { user } = useAuth();
  const { bookingList, otpGenerated, otpTimer, isOtpActive, handleGenerateOtp } = useOutletContext();

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [localRoster, setLocalRoster] = useState([]);

  // Dynamically filter sessions based on current logged in user
  const facultySessions = bookingList.filter(
    b => b.facultyEmail === user?.email || b.facultyName === user?.name || b.createdBy === user?._id || (b.createdBy && b.createdBy.email === user?.email)
  );

  const selectedSession = facultySessions.find(s => s.id === selectedSessionId);

  // Sync roster from selected session
  useEffect(() => {
    if (selectedSession) {
      setLocalRoster(selectedSession.enrolledStudents || []);
    } else {
      setLocalRoster([]);
    }
  }, [selectedSessionId, selectedSession]);

  // Polling roster from database for real-time OTP checks
  useEffect(() => {
    let pollInterval = null;
    if (selectedSessionId && isOtpActive) {
      pollInterval = setInterval(async () => {
        try {
          const attendance = await api.getSessionAttendance(selectedSessionId);
          const mappedRoster = attendance.map(log => ({
            studentId: log.studentId?._id || log._id,
            name: log.studentId?.name || 'Student Name',
            rollNumber: log.studentId?.rollNumber || '21CS001',
            department: log.studentId?.department || '',
            year: log.studentId?.year || '',
            semester: log.studentId?.semester || '',
            surveyCompleted: log.surveyAnswers ? Object.keys(log.surveyAnswers).length > 0 : false,
            attendanceStatus: log.attendanceStatus,
            lastUpdatedBy: log.lastUpdatedBy
          }));
          setLocalRoster(mappedRoster);
        } catch (e) {
          console.error("Roster poll error:", e);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [selectedSessionId, isOtpActive]);

  const handleSelectSession = (id) => {
    setSelectedSessionId(id === selectedSessionId ? null : id);
  };


  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">

      {/* ── Section Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Radio className="w-4 h-4 text-violet-600 animate-pulse" />
          <span>Live Class Session & Attendance Control</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">
          Select a class session below, then generate an OTP to start real-time student check-in.
        </p>
      </div>

      {/* ── Step 1: Session Selector ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Step 1</span>
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Class Session</span>
        </div>

        {facultySessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No bookings found for {user?.name || 'you'}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {facultySessions.map(session => {
              const isSelected = selectedSessionId === session.id;
              const isApproved = session.status === 'Approved' || session.status === 'APPROVED' || session.status === 'CONFIRMED';
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSelectSession(session.id)}
                  disabled={!isApproved}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-violet-600 border-violet-700 text-white shadow-lg shadow-violet-500/20'
                      : isApproved
                        ? 'bg-slate-50 border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                        : 'bg-slate-50 border-slate-150 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {session.title}
                        </span>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border uppercase ${
                          isApproved
                            ? isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-3 text-[10px] font-semibold ${isSelected ? 'text-violet-100' : 'text-slate-500'}`}>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{session.timeSlot}</span>
                        </span>
                        <span>·</span>
                        <span>{session.room}</span>
                        <span>·</span>
                        <span>{session.date}</span>
                      </div>
                      <div className={`text-[9px] font-bold ${isSelected ? 'text-violet-200' : 'text-slate-400'}`}>
                        {session.enrolledStudents?.length || 0} students enrolled
                      </div>
                    </div>
                    <div className={`shrink-0 ml-3 rounded-full border-2 w-5 h-5 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-white bg-white'
                        : 'border-slate-300 bg-transparent'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />}
                    </div>
                  </div>
                  {!isApproved && (
                    <p className="text-[9px] text-amber-600 font-bold mt-1.5">⚠ Booking not yet approved — cannot start OTP session</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Step 2: OTP Generator (locked until session selected) ── */}
      <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${selectedSession ? 'border-slate-200' : 'border-dashed border-slate-200 opacity-60'}`}>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Step 2</span>
          <Radio className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Generate Attendance OTP</span>
        </div>

        {!selectedSession ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 text-center">
            <AlertTriangle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Please select a booking session above to start attendance verification.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selected session summary */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-2">
              <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Active Session</p>
              <p className="text-xs font-black text-violet-900 leading-snug">{selectedSession.title}</p>
              <p className="text-[10px] text-violet-700 font-semibold">{selectedSession.room} · {selectedSession.timeSlot}</p>
              <button
                onClick={() => handleGenerateOtp(selectedSession.id)}
                className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-violet-500/15 flex items-center justify-center space-x-2 uppercase tracking-wider transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isOtpActive ? 'Regenerate OTP' : 'Generate Live OTP'}</span>
              </button>
            </div>

            {/* OTP display */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              {isOtpActive ? (
                <>
                  <div className="font-mono text-3xl font-extrabold text-violet-600 tracking-[0.25em]">
                    {otpGenerated}
                  </div>
                  <span className="text-[9px] bg-violet-100 text-violet-800 font-extrabold px-2.5 py-0.5 rounded border border-violet-200 uppercase tracking-wider">
                    Active Token · {selectedSession.id}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                    <Timer className="w-4 h-4 text-slate-400" />
                    <span>Expires in <span className="font-bold text-slate-700">{formatTimer(otpTimer)}</span></span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 py-4 text-xs flex flex-col items-center space-y-2">
                  <AlertTriangle className="w-7 h-7 opacity-40" />
                  <span>No active OTP. Click generate.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Step 3: Live Student Roster (only when session is selected) ── */}
      {selectedSession && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Step 3</span>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Attendance Roster</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <span>{selectedSession.title}</span>
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Read-only · Statuses reflect OTP check-ins in real time.</p>
            </div>
            <span className="text-xs font-extrabold text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg shrink-0 ml-3">
              {checkedInCount} / {localRoster.length} <span className="text-[10px] font-medium text-slate-500">In</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Status summary chips */}
          <div className="flex flex-wrap gap-2">
            {['PRESENT', 'ABSENT', 'PENDING'].map(status => {
              const count = localRoster.filter(s => s.attendanceStatus === status).length;
              if (count === 0) return null;
              return (
                <span key={status}>
                  <StatusBadge status={status} />
                  <span className="ml-1 text-[9px] font-bold text-slate-500">×{count}</span>
                </span>
              );
            })}
          </div>

          {/* Roster table */}
          {localRoster.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No enrolled students found for this session.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-2 pl-3">Student Profile</th>
                    <th className="p-2">Roll Number</th>
                    <th className="p-2">Academic Details</th>
                    <th className="p-2">Survey Status</th>
                    <th className="p-2 pr-3">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localRoster.map((std) => (
                    <tr key={std.studentId} className="hover:bg-slate-50/50 transition-colors">
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
                        <span className="font-extrabold text-[#0052cc]">{getDeptAbbr(std.department)}</span>
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
                      <td className="p-2 pr-3">
                        <div className="flex flex-col space-y-0.5">
                          <StatusBadge status={std.attendanceStatus} />
                          {std.lastUpdatedBy && (
                            <span className="text-[8px] text-slate-400 font-bold leading-none">{std.lastUpdatedBy}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest">
            Read-Only · Faculty View · Statuses auto-update via OTP system
          </p>
        </div>
      )}

    </div>
  );
};

export default LiveOtpSession;
