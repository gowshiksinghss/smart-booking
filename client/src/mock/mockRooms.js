export const mockRooms = [
  {
    id: "LH-101",
    name: "Lecture Hall 101",
    building: "SF Block",
    capacity: 60,
    department: "Computer Science and Engineering",
    equipment: ["Projector", "Hi-Speed Wi-Fi", "Audio System", "AC"],
    status: "Available",
    currentBooking: null,
    bookings: [
      {
        id: "b1",
        title: "Theory Lecture",
        timeSlot: "09:00 AM - 10:30 AM",
        startTime: "2026-07-27T09:00:00",
        endTime: "2026-07-27T10:30:00",
        user: "Dr. Rajesh Kumar",
        purpose: "Theory Lecture",
        status: "Approved",
        approvedBy: "Subramanian M"
      },
      {
        id: "b2",
        title: "Data Structures Class",
        timeSlot: "11:00 AM - 12:30 PM",
        startTime: "2026-07-27T11:00:00",
        endTime: "2026-07-27T12:30:00",
        user: "Dr. Deepa S",
        purpose: "Data Structures Class",
        status: "Approved",
        approvedBy: "Subramanian M"
      },
      {
        id: "b5",
        title: "Operating Systems Lecture",
        timeSlot: "10:00 AM - 12:00 PM",
        startTime: "2026-07-28T10:00:00",
        endTime: "2026-07-28T12:00:00",
        user: "Prof. Mani K",
        purpose: "Operating Systems Lecture",
        status: "Approved",
        approvedBy: "Subramanian M"
      },
      {
        id: "b6",
        title: "Java Programming Lab",
        timeSlot: "02:00 PM - 04:00 PM",
        startTime: "2026-07-29T14:00:00",
        endTime: "2026-07-29T16:00:00",
        user: "Dr. Rajesh Kumar",
        purpose: "Java Lab Session",
        status: "Pending"
      },
      {
        id: "b7",
        title: "System Hardware Upgrade",
        timeSlot: "09:00 AM - 11:00 AM",
        startTime: "2026-07-31T09:00:00",
        endTime: "2026-07-31T11:00:00",
        user: "System Admin",
        purpose: "Scheduled Maintenance",
        status: "Maintenance"
      }
    ]
  },
  {
    id: "LH-102",
    name: "Lecture Hall 102",
    building: "SF Block",
    capacity: 75,
    department: "Computer Science and Engineering",
    equipment: ["Projector", "Interactive Whiteboard", "AC"],
    status: "Available",
    currentBooking: null,
    bookings: [
      {
        id: "b3",
        title: "Object Oriented Design",
        timeSlot: "01:30 PM - 03:00 PM",
        startTime: "2026-07-27T13:30:00",
        endTime: "2026-07-27T15:00:00",
        user: "Prof. Mani K",
        purpose: "Object Oriented Design",
        status: "Approved",
        approvedBy: "Subramanian M"
      },
      {
        id: "b8",
        title: "Analysis of Algorithms",
        timeSlot: "10:00 AM - 11:30 AM",
        startTime: "2026-07-30T10:00:00",
        endTime: "2026-07-30T11:30:00",
        user: "Dr. Deepa S",
        purpose: "Analysis of Algorithms",
        status: "Approved",
        approvedBy: "Subramanian M"
      }
    ]
  },
  {
    id: "IB-201",
    name: "Seminar Hall 201",
    building: "IB Block",
    capacity: 120,
    department: "Information Technology",
    equipment: ["Dual Projectors", "Surround Sound", "Lecture Capture System", "AC"],
    status: "Booked",
    currentBooking: {
      id: "b4",
      title: "AI Workshop",
      timeSlot: "02:00 PM - 04:30 PM",
      startTime: "2026-07-27T14:00:00",
      endTime: "2026-07-27T16:30:00",
      faculty: "Dr. Rajesh Kumar",
      surveyLocked: true,
      otp: "849201",
      otpCountdown: 300,
      attendanceCount: 14
    },
    bookings: [
      {
        id: "b4",
        title: "AI Workshop",
        timeSlot: "02:00 PM - 04:30 PM",
        startTime: "2026-07-27T14:00:00",
        endTime: "2026-07-27T16:30:00",
        user: "Dr. Rajesh Kumar",
        purpose: "AI Workshop",
        status: "Approved",
        approvedBy: "Subramanian M",
        cohort: "All 3rd Year IT"
      },
      {
        id: "b9",
        title: "Machine Learning Seminar",
        timeSlot: "09:00 AM - 11:30 AM",
        startTime: "2026-07-28T09:00:00",
        endTime: "2026-07-28T11:30:00",
        user: "Dr. Deepa S",
        purpose: "Machine Learning Seminar",
        status: "Approved",
        approvedBy: "Subramanian M"
      },
      {
        id: "b10",
        title: "Electrical Rewiring",
        timeSlot: "01:00 PM - 03:00 PM",
        startTime: "2026-07-29T13:00:00",
        endTime: "2026-07-29T15:00:00",
        user: "Maintenance Team",
        purpose: "Rewiring",
        status: "Maintenance"
      },
      {
        id: "b11",
        title: "Cloud Computing Intro",
        timeSlot: "10:00 AM - 12:00 PM",
        startTime: "2026-07-27T10:00:00",
        endTime: "2026-07-27T12:00:00",
        user: "Prof. Anitha S",
        purpose: "Introductory session",
        status: "Pending"
      }
    ]
  },
  {
    id: "IB-202",
    name: "Smart Classroom 202",
    building: "IB Block",
    capacity: 50,
    department: "Information Technology",
    equipment: ["Projector", "AC", "Visualizer"],
    status: "Available",
    currentBooking: null,
    bookings: []
  },
  {
    id: "ME-301",
    name: "CAD/CAM Seminar Hall",
    building: "Mechanical Block",
    capacity: 90,
    department: "Mechanical Engineering",
    equipment: ["Projector", "Hi-Speed Wi-Fi", "AC"],
    status: "Maintenance",
    currentBooking: null,
    bookings: []
  },
  {
    id: "AS-401",
    name: "Seminar Hall 401",
    building: "Auditorium Block",
    capacity: 150,
    department: "Science and Humanities",
    equipment: ["High-End Audio", "Large Projector Screen", "AC", "Stage Lights"],
    status: "Available",
    currentBooking: null,
    bookings: []
  }
];

export const buildingsList = ["SF Block", "IB Block", "Mechanical Block", "Auditorium Block"];
export const equipmentList = ["Projector", "Interactive Whiteboard", "Audio System", "AC", "Hi-Speed Wi-Fi", "Lecture Capture System"];
export const departmentsList = [
  "Computer Science and Engineering",
  "Information Technology",
  "Mechanical Engineering",
  "Science and Humanities",
  "Electronics and Communication Engineering"
];
export const timeSlotsList = [
  "08:45 AM - 09:40 AM",
  "09:40 AM - 10:35 AM",
  "10:50 AM - 11:45 AM",
  "11:45 AM - 12:40 PM",
  "01:30 PM - 02:25 PM",
  "02:25 PM - 03:20 PM",
  "03:20 PM - 04:15 PM"
];
