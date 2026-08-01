import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, AlertTriangle, Trash, Users, ChevronDown, ChevronUp, Users2, Shield } from 'lucide-react';
import { mockRooms, departmentsList, timeSlotsList } from '../../mock/mockRooms';
import { mockFacultyGroups } from '../../mock/mockGroups';
import { demoProfiles } from '../../mock/mockUsers';
import { api } from '../../utils/api';

const MOCK_STUDENTS = [
  { studentId: "student-1", name: "Adithya K", rollNumber: "21CS001", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: true, attendanceStatus: "PRESENT" },
  { studentId: "student-2", name: "Keerthana S", rollNumber: "21CS045", department: "Computer Science and Engineering", year: "3rd Year", semester: "Semester 6", surveyCompleted: false, attendanceStatus: "ABSENT" },
  { studentId: "student-3", name: "Abhinav R", rollNumber: "22IT012", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PENDING" },
  { studentId: "student-4", name: "Sneha P", rollNumber: "22IT098", department: "Information Technology", year: "2nd Year", semester: "Semester 4", surveyCompleted: true, attendanceStatus: "PRESENT" }
];

const getDeptAbbr = (dept = '') => {
  if (dept.toLowerCase().includes('computer')) return 'CSE';
  if (dept.toLowerCase().includes('information')) return 'IT';
  if (dept.toLowerCase().includes('mechanical')) return 'ME';
  if (dept.toLowerCase().includes('electrical')) return 'EEE';
  return dept;
};

const getStudentDetails = (roll) => {
  const found = demoProfiles?.find(p => p.rollNumber === roll || p.rollNo === roll);
  if (found) {
    return {
      studentId: found.id,
      name: found.name,
      rollNumber: roll,
      department: found.department,
      year: found.year,
      semester: found.semester,
      surveyCompleted: false,
      attendanceStatus: "PENDING"
    };
  }
  return {
    studentId: "student-" + roll,
    name: "Student " + roll,
    rollNumber: roll,
    department: "Computer Science and Engineering",
    year: "3rd Year",
    semester: "Semester 6",
    surveyCompleted: false,
    attendanceStatus: "PENDING"
  };
};

const InitiateBooking = () => {
  const navigate = useNavigate();
  const { bookingList, setBookingList, surveys, setSurveys, triggerToast, rooms, refreshData } = useOutletContext();
  const [rosterOpenIds, setRosterOpenIds] = useState(new Set());

  // Initiative Form States
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('2026-08-01');
  const [timeSlot, setTimeSlot] = useState(timeSlotsList[1]);
  const [targetDept, setTargetDept] = useState(departmentsList[0]);
  const [rollTags, setRollTags] = useState('');
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (rooms && rooms.length > 0 && !room) {
      setRoom(rooms[0].id);
    }
  }, [rooms, room]);

  // Audience Visibility & Permissions States
  const [audienceType, setAudienceType] = useState('department'); // 'department' or 'custom_group'
  const [customGroups, setCustomGroups] = useState(mockFacultyGroups);
  const [selectedGroupId, setSelectedGroupId] = useState(mockFacultyGroups[0]?.groupId || '');
  
  // Custom group creator modal state
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRolls, setNewGroupRolls] = useState('');

  // Join Requests states
  const [allowJoinRequests, setAllowJoinRequests] = useState(false);
  const [eligibleRequestors, setEligibleRequestors] = useState('All Students in Department');


  // Survey States
  const [attachSurvey, setAttachSurvey] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyQuestions, setSurveyQuestions] = useState([
    { id: 'sq-1', text: 'Rate the facility readiness (AC, projector, chairs):', type: 'rating' }
  ]);

  const addQuestion = (type) => {
    const newQ = {
      id: `sq-${Date.now()}`,
      text: type === 'rating' ? 'Rate the session content:' : 'Select feedback:',
      type,
      options: type === 'choice' ? ['Yes', 'No'] : undefined
    };
    setSurveyQuestions([...surveyQuestions, newQ]);
  };

  const removeQuestion = (id) => {
    setSurveyQuestions(surveyQuestions.filter(q => q.id !== id));
  };

  const handleCreateInitiative = async (e) => {
    e.preventDefault();
    if (!title || !reason) {
      triggerToast("Please fill in all required initiative fields.");
      return;
    }

    let finalSurveyId = '';
    if (attachSurvey) {
      const newSurvey = {
        id: `survey-${Date.now()}`,
        title: surveyTitle || `${title} Feedback`,
        questions: surveyQuestions
      };
      setSurveys(prev => [...prev, newSurvey]);
      finalSurveyId = newSurvey.id;
    }

    const selectedRoom = (rooms || []).find(r => r.id === room);

    // Calculate allowedRollNumbers and group name
    let allowedRolls = [];
    let displayGroupName = "";
    if (audienceType === 'custom_group') {
      const activeGrp = customGroups.find(g => g.groupId === selectedGroupId);
      if (activeGrp) {
        allowedRolls = activeGrp.rollNumbers || [];
        displayGroupName = activeGrp.groupName;
      }
    } else {
      if (rollTags) {
        allowedRolls = rollTags.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const parseTimeSlot = (dateStr, slotStr) => {
      const [startPart, endPart] = slotStr.split('-').map(s => s.trim());
      
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const d = new Date(dateStr);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      return {
        startTime: parseTime(startPart),
        endTime: parseTime(endPart)
      };
    };

    const { startTime, endTime } = parseTimeSlot(date, timeSlot);

    try {
      await api.createBooking({
        eventName: title,
        allocatedRoom: room,
        startTime,
        endTime,
        targetAudience: {
          type: audienceType,
          groupName: audienceType === 'custom_group' ? displayGroupName : undefined,
          allowedRollNumbers: allowedRolls
        },
        allowJoinRequests,
        reason
      });

      triggerToast("Initiative request submitted successfully!");
      if (refreshData) {
        await refreshData();
      }
      navigate('/faculty/dashboard');
    } catch (err) {
      triggerToast(`Failed to create booking: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-800 animate-fadeIn">
      
      {/* Initiative Form */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <PlusCircle className="w-4.5 h-4.5 text-blue-600" />
            <span>Classroom Initiative Booking Form</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Submit classroom booking requirements for department authorization.</p>
        </div>

        <form onSubmit={handleCreateInitiative} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Special Lab Session"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Classroom *</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
              >
                {(rooms || []).map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Seats: {r.capacity})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Preferred Time Slot *</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
              >
                {timeSlotsList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
              <Users2 className="w-4 h-4 text-violet-600" />
              <span>Target Audience & Visibility Setup</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-violet-300">
                <input
                  type="radio"
                  name="audienceType"
                  value="department"
                  checked={audienceType === 'department'}
                  onChange={() => setAudienceType('department')}
                  className="w-4 h-4 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">Target Dept / Cohort</span>
              </label>

              <label className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-violet-300">
                <input
                  type="radio"
                  name="audienceType"
                  value="custom_group"
                  checked={audienceType === 'custom_group'}
                  onChange={() => setAudienceType('custom_group')}
                  className="w-4 h-4 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">Custom Student Group</span>
              </label>
            </div>

            {audienceType === 'department' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Department *</label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
                  >
                    {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Roll Numbers (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 21CS001, 21CS045"
                    value={rollTags}
                    onChange={(e) => setRollTags(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Saved Custom Group *</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
                    >
                      {customGroups.map(g => (
                        <option key={g.groupId} value={g.groupId}>
                          {g.groupName} ({g.rollNumbers?.length || 0} students)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowGroupCreator(true)}
                      className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      + Create Group
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Join Requests Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Join Request Permissions</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                  Allow Unlisted Students to Request to Join?
                </label>
                <p className="text-[10px] text-slate-400 font-medium">Allows students not in target cohort/group to view slot and send access requests.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowJoinRequests}
                  onChange={(e) => setAllowJoinRequests(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {allowJoinRequests && (
              <div className="animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Eligible Requestors</label>
                <select
                  value={eligibleRequestors}
                  onChange={(e) => setEligibleRequestors(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
                >
                  <option value="All Students in Department">All Students in Department</option>
                  <option value="Open to All Departments">Open to All Departments</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose / Agenda *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide a short description of the academic session/activity..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* Custom Survey Option */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="attachSurvey"
                checked={attachSurvey}
                onChange={(e) => setAttachSurvey(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="attachSurvey" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                Attach Custom Survey Gateway for this Session
              </label>
            </div>

            {attachSurvey && (
              <div className="space-y-4 pt-2 border-t border-slate-200/60 animate-fadeIn">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Survey Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Session Feedback Form"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 text-slate-700 font-semibold"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Questions list</span>
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        onClick={() => addQuestion('rating')}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors"
                      >
                        + Rating
                      </button>
                      <button
                        type="button"
                        onClick={() => addQuestion('choice')}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors"
                      >
                        + Choices
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {surveyQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-white border border-slate-150 p-2.5 rounded-lg flex justify-between items-start space-x-2 shadow-sm">
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] font-mono text-[#0052cc] font-extrabold uppercase">Q{idx + 1} ({q.type})</span>
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => {
                              const newQs = [...surveyQuestions];
                              newQs[idx].text = e.target.value;
                              setSurveyQuestions(newQs);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-[10px] outline-none text-slate-700 font-medium"
                          />
                          {q.type === 'choice' && (
                            <input
                              type="text"
                              value={q.options?.join(', ')}
                              onChange={(e) => {
                                const newQs = [...surveyQuestions];
                                newQs[idx].options = e.target.value.split(',').map(s => s.trim());
                                setSurveyQuestions(newQs);
                              }}
                              placeholder="Comma separated options"
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-[9px] outline-none text-slate-500"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer mt-1"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-blue-500/10 uppercase tracking-widest transition-colors cursor-pointer"
          >
            Submit Initiative Request
          </button>
        </form>
      </div>

      {/* Sidebar: Initiative log */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Initiatives Log</span>
        </h3>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {bookingList.map((item) => {
            const roster = item.enrolledStudents || MOCK_STUDENTS;
            const checkedIn = roster.filter(s => s.attendanceStatus === 'PRESENT').length;
            const isRosterOpen = rosterOpenIds.has(item.id);
            return (
              <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]" title={item.title}>
                    {item.title}
                  </h4>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                    item.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    item.status === 'Pending' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 space-y-1 font-medium">
                  <p>Room: <span className="font-bold text-slate-800">{item.room}</span></p>
                  <p>Time: <span className="font-bold text-slate-800">{item.timeSlot}</span></p>
                  <p>Audience: <span className="font-bold text-slate-800">{item.targetAudience?.type === 'custom_group' ? `👥 ${item.targetAudience.groupName}` : `🏢 ${item.targetDepartment || item.department}`}</span></p>
                  {item.surveyId && (
                    <p className="text-blue-600 font-semibold flex items-center space-x-1 mt-0.5">
                      <span>📋 Custom Survey Attached</span>
                    </p>
                  )}
                  {item.conflict && (
                    <div className="flex items-center space-x-1 text-red-600 font-bold mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Schedule Conflict Warning</span>
                    </div>
                  )}
                </div>

                {/* Roster toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setRosterOpenIds(prev => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    });
                  }}
                  className="w-full flex items-center justify-between py-1.5 px-2 text-[10px] font-bold text-[#0052cc] bg-blue-50 hover:bg-blue-100 rounded-lg transition-all cursor-pointer border border-blue-100 mt-1"
                >
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Enrolled Roster</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-extrabold">{checkedIn}/{roster.length}</span>
                    {isRosterOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </span>
                </button>

                {isRosterOpen && (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white mt-1">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[8.5px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="p-1.5 pl-2">Name</th>
                          <th className="p-1.5">Roll</th>
                          <th className="p-1.5">Dept | Year</th>
                          <th className="p-1.5">Survey</th>
                          <th className="p-1.5 pr-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roster.map(std => (
                          <tr key={std.studentId} className="hover:bg-slate-50/50">
                            <td className="p-1.5 pl-2 font-semibold text-slate-800">{std.name}</td>
                            <td className="p-1.5 font-mono text-slate-600">{std.rollNumber || std.rollNo}</td>
                            <td className="p-1.5 text-slate-500">
                              <span className="font-extrabold text-[#0052cc]">{getDeptAbbr(std.department)}</span>
                              <span className="mx-0.5">·</span>
                              <span>{std.year}</span>
                            </td>
                            <td className="p-1.5">
                              <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full border ${
                                std.surveyCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}>
                                {std.surveyCompleted ? '✓' : '–'}
                              </span>
                            </td>
                            <td className="p-1.5 pr-2">
                              <span className={`text-[8px] font-black px-1 py-0.5 rounded border uppercase ${
                                std.attendanceStatus === 'PRESENT' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                std.attendanceStatus === 'ABSENT' ? 'bg-red-50 text-red-800 border-red-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {std.attendanceStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOM GROUP CREATOR MODAL */}
      {showGroupCreator && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp text-left">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Create Custom Student Group</h4>
              <button
                type="button"
                onClick={() => setShowGroupCreator(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. DS Lab Team A"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Roll Numbers (Comma Separated)</label>
                <textarea
                  placeholder="e.g. 21CS001, 21CS005, 21CS042"
                  rows={3}
                  value={newGroupRolls}
                  onChange={(e) => setNewGroupRolls(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 font-semibold resize-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newGroupName || !newGroupRolls) {
                    triggerToast("Please enter both group name and roll numbers.");
                    return;
                  }
                  const rollNumbers = newGroupRolls.split(',').map(r => r.trim()).filter(Boolean);
                  const newGroup = {
                    groupId: "grp-" + Date.now(),
                    groupName: newGroupName,
                    facultyId: "fac-001",
                    rollNumbers
                  };
                  setCustomGroups([...customGroups, newGroup]);
                  setSelectedGroupId(newGroup.groupId);
                  setShowGroupCreator(false);
                  setNewGroupName('');
                  setNewGroupRolls('');
                  triggerToast(`Custom group "${newGroup.groupName}" created!`);
                }}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Custom Group
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InitiateBooking;
