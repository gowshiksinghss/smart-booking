import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Radio, BookOpen, AlertTriangle, Clock, Users, Shield, Check, Calendar } from 'lucide-react';

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
    PRESENT: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: '✓ Present' },
    ABSENT:  { cls: 'bg-red-50 text-red-800 border-red-200',             label: '✗ Absent'  },
    PENDING: { cls: 'bg-amber-50 text-amber-800 border-amber-200',       label: '⏳ Pending' },
  };
  const cfg = configs[status] || configs.PENDING;
  return (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const StaffOtpSession = () => {
  const {
    rooms, setRooms,
    bookingQueue, setBookingQueue,
    otpGenerated, setOtpGenerated,
    otpTimer, setOtpTimer,
    isOtpActive, setIsOtpActive,
    triggerToast, handleGenerateOtp
  } = useOutletContext();

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [localRoster, setLocalRoster] = useState([]);

  // Date filtering state
  const [filterType, setFilterType] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter approved direct staff bookings and faculty bookings
  const staffSessions = (bookingQueue || []).filter(
    b => b.status === 'APPROVED' || b.status === 'Approved'
  );

  // Date filtering logic
  const filteredSessions = staffSessions.filter(session => {
    if (filterType === 'all') return true;
    if (!session.startTime) return false;
    
    const sessionDateStr = new Date(session.startTime).toISOString().split('T')[0];
    
    if (filterType === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return sessionDateStr === todayStr;
    }
    if (filterType === 'date') {
      return sessionDateStr === selectedDate;
    }
    return true;
  });

  const selectedSession = staffSessions.find(s => s.id === selectedSessionId);

  // Sync roster from selected session
  useEffect(() => {
    if (selectedSession) {
      setLocalRoster(selectedSession.enrolledStudents || []);
    } else {
      setLocalRoster([]);
    }
  }, [selectedSessionId, bookingQueue]);

  const checkedInCount = localRoster.filter(s => s.attendanceStatus === 'PRESENT').length;
  const progressPct = localRoster.length > 0 ? (checkedInCount / localRoster.length) * 100 : 0;

  const handleSelectSession = (id) => {
    setSelectedSessionId(id === selectedSessionId ? null : id);
  };

  const handleUpdateStudentAttendance = (studentId, newStatus) => {
    const reason = window.prompt("Reason for manual override (e.g., Medical Certificate, OTP Timeout Error):", "Technical OTP Error");
    if (reason === null) return;

    // Update bookingQueue
    setBookingQueue(prev => prev.map(b => {
      if (b.id === selectedSession.id) {
        return {
          ...b,
          enrolledStudents: (b.enrolledStudents || []).map(s => 
            s.studentId === studentId
              ? { ...s, attendanceStatus: newStatus, lastUpdatedBy: `Manually Updated by Staff (${reason || 'No reason'})` }
              : s
          )
        };
      }
      return b;
    }));

    // Update rooms
    setRooms(prevRooms => prevRooms.map(r => {
      return {
        ...r,
        bookings: (r.bookings || []).map(b => {
          if (b.id === selectedSession.id) {
            return {
              ...b,
              enrolledStudents: (b.enrolledStudents || []).map(s => 
                s.studentId === studentId
                  ? { ...s, attendanceStatus: newStatus, lastUpdatedBy: `Manually Updated by Staff (${reason || 'No reason'})` }
                  : s
              )
            };
          }
          return b;
        })
      };
    }));

    triggerToast(`Attendance updated for student.`);
  };

  const handleApproveJoinRequest = (requestId) => {
    const requestObj = (selectedSession.joinRequests || []).find(r => r.requestId === requestId);
    if (!requestObj) return;

    const newStudent = {
      studentId: requestObj.studentId,
      name: requestObj.name,
      rollNumber: requestObj.rollNumber,
      department: requestObj.department,
      year: requestObj.year,
      semester: requestObj.semester,
      surveyCompleted: false,
      attendanceStatus: 'PENDING',
      lastUpdatedBy: 'Approved Request'
    };

    // Update bookingQueue
    setBookingQueue(prev => prev.map(b => {
      if (b.id === selectedSession.id) {
        return {
          ...b,
          enrolledStudents: [...(b.enrolledStudents || []), newStudent],
          joinRequests: (b.joinRequests || []).filter(r => r.requestId !== requestId)
        };
      }
      return b;
    }));

    // Update rooms
    setRooms(prevRooms => prevRooms.map(r => {
      return {
        ...r,
        bookings: (r.bookings || []).map(b => {
          if (b.id === selectedSession.id) {
            return {
              ...b,
              enrolledStudents: [...(b.enrolledStudents || []), newStudent],
              joinRequests: (b.joinRequests || []).filter(r => r.requestId !== requestId)
            };
          }
          return b;
        })
      };
    }));

    triggerToast(`Approved join request for ${requestObj.name}`);
  };

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">

      {/* ── Section Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Staff Direct Session & Live Attendance Control</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">
          Select your staff session below, then generate a live OTP for attendee check-in.
        </p>
      </div>

      {/* ── Step 1: Session Selector ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Step 1</span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Staff Session</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setFilterType('today')}
                className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterType === 'today'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setFilterType('date')}
                className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterType === 'date'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Choose Date
              </button>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
            </div>

            {filterType === 'date' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-[10px] font-bold text-slate-850 bg-white border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}
          </div>
        </div>

        {staffSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active or approved staff bookings found.</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-550 animate-pulse" />
            <p>No active sessions found for this filter/date.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map(session => {
              const isSelected = selectedSessionId === session.id;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {session.title}
                        </span>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border uppercase ${
                          isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-3 text-[10px] font-semibold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{session.timeSlot}</span>
                        </span>
                        <span>·</span>
                        <span>{session.room}</span>
                        <span>·</span>
                        <span>{session.date}</span>
                      </div>
                      <div className={`text-[9px] font-bold ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {session.enrolledStudents?.length || 0} students enrolled
                      </div>
                    </div>
                    <div className={`shrink-0 ml-3 rounded-full border-2 w-5 h-5 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-white bg-white'
                        : 'border-slate-300 bg-transparent'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Step 2: OTP Generator ── */}
      {selectedSession && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* OTP Generation Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Step 2</span>
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live OTP Generator</span>
              </div>

              <h4 className="text-xs font-bold text-slate-800">Broadcast OTP Session</h4>
              <p className="text-[10px] text-slate-500 mt-1">
                Generates a live broadcast token valid for 5 minutes.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateOtp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 cursor-pointer text-center"
              >
                {isOtpActive ? 'Regenerate OTP' : 'Generate Live OTP'}
              </button>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                {isOtpActive ? (
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-slate-900 tracking-widest block font-mono">
                      {otpGenerated}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      Expires in <span className="text-slate-700">{formatTimer(otpTimer)}</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 block py-1">
                    No active OTP. Click generate.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Roster & Roster Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Step 3</span>
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendee Roster</span>
                </div>
                <h4 className="text-xs font-bold text-slate-850 mt-1">{selectedSession.title}</h4>
              </div>
              <span className="text-xs font-black text-slate-800 bg-slate-55.0/10 px-2 py-1 rounded border border-slate-200">
                {checkedInCount} / {localRoster.length} Checked In
              </span>
            </div>

            {/* Roster Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Join Requests Queue (if any) */}
            {selectedSession.joinRequests && selectedSession.joinRequests.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                <span className="text-[9.5px] font-black text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Join Requests Queue ({selectedSession.joinRequests.length})</span>
                </span>
                <div className="space-y-2">
                  {selectedSession.joinRequests.map(req => (
                    <div key={req.requestId} className="bg-white border border-amber-100 rounded-lg p-2.5 flex items-center justify-between text-xs shadow-sm">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">
                          {req.name} <span className="text-[10px] text-slate-400">({req.rollNumber})</span>
                        </p>
                        <p className="text-[9px] text-slate-500 italic">" {req.reasonNote} "</p>
                      </div>
                      <button
                        onClick={() => handleApproveJoinRequest(req.requestId)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roster List Table */}
            {localRoster.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No students checked in or enrolled.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-150">
                    <tr>
                      <th className="p-2.5 pl-3">Student Name</th>
                      <th className="p-2.5">Roll No</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localRoster.map(student => (
                      <tr key={student.studentId} className="hover:bg-slate-50/50">
                        <td className="p-2.5 pl-3 font-bold text-slate-800">{student.name}</td>
                        <td className="p-2.5 font-semibold text-slate-500">{student.rollNumber}</td>
                        <td className="p-2.5 font-bold text-[#0052cc]">{getDeptAbbr(student.department)}</td>
                        <td className="p-2.5">
                          <div className="flex flex-col">
                            <StatusBadge status={student.attendanceStatus} />
                            {student.lastUpdatedBy && (
                              <span className="text-[7.5px] text-slate-400 font-semibold">{student.lastUpdatedBy}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 pr-3 text-right">
                          <select
                            value={student.attendanceStatus}
                            onChange={(e) => handleUpdateStudentAttendance(student.studentId, e.target.value)}
                            className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="PENDING">Pending</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default StaffOtpSession;
