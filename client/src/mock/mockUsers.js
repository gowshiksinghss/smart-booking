export const mockUsers = {
  student: {
    id: "student-1",
    name: "Adithya K",
    email: "adithya.cs21@bitsathy.ac.in",
    role: "student",
    rollNumber: "21CS001",
    rollNo: "21CS001",
    department: "Computer Science and Engineering",
    year: "3rd Year",
    semester: "Semester 6",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adithya"
  },
  faculty: {
    id: "faculty-1",
    name: "Dr. Rajesh Kumar",
    email: "rajeshkumar@bitsathy.ac.in",
    role: "faculty",
    facultyId: "FAC-IT-042",
    designation: "Associate Professor",
    department: "Information Technology",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
  },
  staff: {
    id: "staff-1",
    name: "Subramanian M",
    email: "subramanian@bitsathy.ac.in",
    role: "staff",
    staffId: "STF-CS-012",
    designation: "Department Coordinator",
    department: "Computer Science and Engineering",
    block: "SF Block - CSE",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Subru"
  },
  admin: {
    id: "admin-1",
    name: "Admin Governance",
    email: "admin.governance@bitsathy.ac.in",
    role: "admin",
    department: "Academic Office",
    designation: "Chief Academic Administrator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  }
};

export const demoProfiles = [
  // Student Mode Profile (kept for navbar profile switching dropdown compatibility)
  {
    id: "student-1",
    name: "Adithya K",
    email: "adithya.cs21@bitsathy.ac.in",
    role: "student",
    rollNumber: "21CS001",
    rollNo: "21CS001",
    department: "Computer Science and Engineering",
    year: "3rd Year",
    semester: "Semester 6",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adithya",
    label: "Student Mode"
  },
  {
    id: "faculty-1",
    name: "Dr. Rajesh Kumar",
    email: "rajeshkumar@bitsathy.ac.in",
    role: "faculty",
    facultyId: "FAC-IT-042",
    designation: "Associate Professor",
    department: "Information Technology",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    label: "Faculty Mode"
  },
  {
    id: "staff-1",
    name: "Subramanian M",
    email: "subramanian@bitsathy.ac.in",
    role: "staff",
    staffId: "STF-CS-012",
    designation: "Department Coordinator",
    department: "Computer Science and Engineering",
    block: "SF Block - CSE",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Subru",
    label: "Staff Mode"
  },
  {
    id: "admin-1",
    name: "Admin Governance",
    email: "admin.governance@bitsathy.ac.in",
    role: "admin",
    department: "Academic Office",
    designation: "Chief Academic Administrator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    label: "Admin Mode"
  },

  // Additional mock database profiles for rich governance tree
  {
    id: "student-2",
    name: "Keerthana S",
    email: "keerthana.cs21@bitsathy.ac.in",
    role: "student",
    rollNumber: "21CS045",
    rollNo: "21CS045",
    department: "Computer Science and Engineering",
    year: "3rd Year",
    semester: "Semester 6",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Keerthana"
  },
  {
    id: "student-3",
    name: "Abhinav R",
    email: "abhinav.it22@bitsathy.ac.in",
    role: "student",
    rollNumber: "22IT012",
    rollNo: "22IT012",
    department: "Information Technology",
    year: "2nd Year",
    semester: "Semester 4",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abhinav"
  },
  {
    id: "student-4",
    name: "Sneha P",
    email: "sneha.it22@bitsathy.ac.in",
    role: "student",
    rollNumber: "22IT098",
    rollNo: "22IT098",
    department: "Information Technology",
    year: "2nd Year",
    semester: "Semester 4",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"
  },
  {
    id: "student-5",
    name: "Dharanish M",
    email: "dharanish.me23@bitsathy.ac.in",
    role: "student",
    rollNumber: "23ME005",
    rollNo: "23ME005",
    department: "Mechanical Engineering",
    year: "1st Year",
    semester: "Semester 2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dharanish"
  },
  {
    id: "student-6",
    name: "Sandeep V",
    email: "sandeep.ee23@bitsathy.ac.in",
    role: "student",
    rollNumber: "23EE087",
    rollNo: "23EE087",
    department: "Electrical & Electronics Engineering",
    year: "1st Year",
    semester: "Semester 2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sandeep"
  },
  {
    id: "faculty-2",
    name: "Dr. Arul Selvan",
    email: "arulselvan@bitsathy.ac.in",
    role: "faculty",
    department: "Information Technology",
    facultyId: "FAC-IT-008",
    designation: "Professor & Head",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arul"
  },
  {
    id: "faculty-3",
    name: "Mrs. Shalini Devi",
    email: "shalinidevi@bitsathy.ac.in",
    role: "faculty",
    department: "Electrical & Electronics Engineering",
    facultyId: "FAC-EE-112",
    designation: "Assistant Professor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shalini"
  },
  {
    id: "faculty-4",
    name: "Mr. Koushik R",
    email: "koushik@bitsathy.ac.in",
    role: "faculty",
    department: "Mechanical Engineering",
    facultyId: "FAC-ME-056",
    designation: "Assistant Professor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Koushik"
  },
  {
    id: "staff-2",
    name: "Mariyappan K",
    email: "mariyappan@bitsathy.ac.in",
    role: "staff",
    department: "Information Technology",
    staffId: "STF-IT-088",
    designation: "Lab Assistant",
    block: "IB Block - IT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariyappan"
  },
  {
    id: "staff-3",
    name: "Murugesan A",
    email: "murugesan@bitsathy.ac.in",
    role: "staff",
    department: "Mechanical Engineering",
    staffId: "STF-ME-056",
    designation: "Workshop Instructor",
    block: "OB Block - ME",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Murugesan"
  }
];
