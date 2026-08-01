export const mockBookings = [
  {
    id: "init-101",
    title: "Vite + React Interactive Coding Session",
    facultyName: "Dr. Rajesh Kumar",
    facultyEmail: "rajeshkumar@bitsathy.ac.in",
    room: "LH-101",
    building: "SF Block",
    date: "2026-08-01",
    timeSlot: "09:40 AM - 11:45 AM",
    startTime: "2026-08-01T09:40:00",
    endTime: "2026-08-01T11:45:00",
    department: "Computer Science and Engineering",
    targetDepartment: "Computer Science and Engineering",
    rollNumberTags: "21CS001, 21CS002, 21CS005, 21CS010, 21CS023",
    status: "Pending", // Pending, Approved, Rejected
    conflict: false,
    reason: "Hands-on coding workshop for core modules.",
    targetAudience: {
      type: "department",
      allowedRollNumbers: ["21CS001", "21CS002", "21CS005", "21CS010", "21CS023"]
    },
    allowJoinRequests: true,
    joinRequests: [
      {
        requestId: "req-002",
        studentId: "student-3",
        name: "Abhinav R",
        rollNumber: "22IT012",
        department: "Information Technology",
        year: "2nd Year",
        semester: "Semester 4",
        reasonNote: "Request to join for extra credit lab work.",
        status: "PENDING"
      }
    ],
    enrolledStudents: [
      {
        studentId: "student-1",
        name: "Adithya K",
        rollNumber: "21CS001",
        department: "Computer Science and Engineering",
        year: "3rd Year",
        semester: "Semester 6",
        surveyCompleted: true,
        attendanceStatus: "PRESENT",
        lastUpdatedBy: "System (OTP)"
      },
      {
        studentId: "student-2",
        name: "Keerthana S",
        rollNumber: "21CS045",
        department: "Computer Science and Engineering",
        year: "3rd Year",
        semester: "Semester 6",
        surveyCompleted: false,
        attendanceStatus: "ABSENT",
        lastUpdatedBy: "System (OTP)"
      }
    ]
  },
  {
    id: "init-102",
    title: "Guest Lecture on Cloud Architectures",
    facultyName: "Prof. Anitha S",
    facultyEmail: "anithas@bitsathy.ac.in",
    room: "IB-201",
    building: "IB Block",
    date: "2026-08-01",
    timeSlot: "01:30 PM - 03:20 PM",
    startTime: "2026-08-01T13:30:00",
    endTime: "2026-08-01T15:20:00",
    department: "Information Technology",
    targetDepartment: "Information Technology",
    rollNumberTags: "All 3rd Year IT",
    status: "Pending",
    conflict: true, // Conflict warning because IB-201 is booked at 02:00 PM
    reason: "Alumni lecture from Amazon AWS team.",
    targetAudience: {
      type: "department",
      allowedRollNumbers: ["22IT012", "22IT098"]
    },
    allowJoinRequests: true,
    joinRequests: [
      {
        requestId: "req-001",
        studentId: "student-1",
        name: "Adithya K",
        rollNumber: "21CS001",
        department: "Computer Science and Engineering",
        year: "3rd Year",
        semester: "Semester 6",
        reasonNote: "Missed previous lab due to sports meet.",
        status: "PENDING"
      }
    ],
    enrolledStudents: [
      {
        studentId: "student-3",
        name: "Abhinav R",
        rollNumber: "22IT012",
        department: "Information Technology",
        year: "2nd Year",
        semester: "Semester 4",
        surveyCompleted: true,
        attendanceStatus: "PENDING",
        lastUpdatedBy: "System"
      },
      {
        studentId: "student-4",
        name: "Sneha P",
        rollNumber: "22IT098",
        department: "Information Technology",
        year: "2nd Year",
        semester: "Semester 4",
        surveyCompleted: true,
        attendanceStatus: "PRESENT",
        lastUpdatedBy: "System (OTP)"
      }
    ]
  },
  {
    id: "init-103",
    title: "Design Patterns Masterclass",
    facultyName: "Dr. Rajesh Kumar",
    facultyEmail: "rajeshkumar@bitsathy.ac.in",
    room: "LH-102",
    building: "SF Block",
    date: "2026-07-31",
    timeSlot: "01:30 PM - 03:00 PM",
    startTime: "2026-07-31T13:30:00",
    endTime: "2026-07-31T15:00:00",
    department: "Computer Science and Engineering",
    targetDepartment: "Computer Science and Engineering",
    rollNumberTags: "21CS001, 21CS045",
    status: "Approved",
    conflict: false,
    reason: "Curriculum alignment session on Creational & Structural patterns.",
    targetAudience: {
      type: "custom_group",
      groupName: "DS Project Team Alpha",
      allowedRollNumbers: ["21CS001", "21CS005", "21CS012", "21CS045"]
    },
    allowJoinRequests: true,
    joinRequests: [],
    enrolledStudents: [
      {
        studentId: "student-1",
        name: "Adithya K",
        rollNumber: "21CS001",
        department: "Computer Science and Engineering",
        year: "3rd Year",
        semester: "Semester 6",
        surveyCompleted: true,
        attendanceStatus: "PRESENT",
        lastUpdatedBy: "System (OTP)"
      },
      {
        studentId: "student-2",
        name: "Keerthana S",
        rollNumber: "21CS045",
        department: "Computer Science and Engineering",
        year: "3rd Year",
        semester: "Semester 6",
        surveyCompleted: true,
        attendanceStatus: "PRESENT",
        lastUpdatedBy: "System (OTP)"
      }
    ]
  },
  {
    id: "bk-staff-201",
    bookingId: "bk-staff-201",
    title: "Departmental Association Briefing",
    eventName: "Departmental Association Briefing",
    room: "IB-201",
    allocatedRoom: "IB-201",
    date: "2026-08-01",
    timeSlot: "02:00 PM - 03:30 PM",
    startTime: "2026-08-01T14:00:00",
    endTime: "2026-08-01T15:30:00",
    initiatedByRole: "staff",
    staffName: "Subramanian M",
    facultyName: "Subramanian M",
    department: "Computer Science and Engineering",
    targetDepartment: "Computer Science and Engineering",
    status: "APPROVED",
    allowJoinRequests: true,
    enrolledStudents: [
      {
        studentId: "student-1",
        name: "Adithya K",
        rollNumber: "21CS001",
        department: "Computer Science and Engineering",
        year: "3rd Year",
        semester: "Semester 6",
        surveyCompleted: true,
        attendanceStatus: "PRESENT",
        lastUpdatedBy: "System (OTP)"
      },
      {
        studentId: "student-2",
        name: "Keerthana S",
        rollNumber: "21CS045",
        department: "Computer Science and Engineering",
        year: "3rd Year",
        semester: "Semester 6",
        surveyCompleted: false,
        attendanceStatus: "PENDING",
        lastUpdatedBy: "System"
      }
    ],
    joinRequests: [
      {
        requestId: "req-staff-001",
        studentId: "student-3",
        name: "Abhinav R",
        rollNumber: "22IT012",
        department: "Information Technology",
        year: "2nd Year",
        semester: "Semester 4",
        reasonNote: "Need to attend departmental session.",
        status: "PENDING"
      }
    ]
  }
];

export const mockNotifications = [
  {
    id: "n-1",
    title: "AI Workshop Schedule",
    message: "The AI Workshop will start at 02:00 PM today at Seminar Hall 201. Attendance via OTP and Pre-Survey is mandatory.",
    sender: "Dr. Rajesh Kumar",
    targetType: "Department",
    targetValue: "Information Technology",
    timestamp: "2026-07-31T10:00:00Z"
  },
  {
    id: "n-2",
    title: "Special Lab Lab-102 Coding Class",
    message: "Special lab session on React Router in Room LH-102. Bring your laptops.",
    sender: "Prof. Mani K",
    targetType: "RollNumbers",
    targetValue: "21CS001, 21CS045",
    timestamp: "2026-07-31T11:30:00Z"
  }
];

export const mockUsageReports = [
  { month: "January", utilizationRate: 68, hoursBooked: 240, bookingsCount: 120 },
  { month: "February", utilizationRate: 74, hoursBooked: 280, bookingsCount: 140 },
  { month: "March", utilizationRate: 85, hoursBooked: 320, bookingsCount: 160 },
  { month: "April", utilizationRate: 80, hoursBooked: 300, bookingsCount: 150 },
  { month: "May", utilizationRate: 50, hoursBooked: 180, bookingsCount: 90 },
  { month: "June", utilizationRate: 40, hoursBooked: 150, bookingsCount: 75 },
  { month: "July", utilizationRate: 88, hoursBooked: 340, bookingsCount: 175 }
];
