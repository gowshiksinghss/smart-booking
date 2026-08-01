const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/@bitsathy\.ac\.in$/, 'Only @bitsathy.ac.in emails are allowed'] 
  },
  role: { 
    type: String, 
    enum: ['student', 'faculty', 'staff', 'admin'], 
    default: 'student' 
  },
  department: { type: String, required: true },
  rollNumber: { type: String, default: null }, // Required for Students (e.g., 21CS001)
  facultyId: { type: String, default: null },  // Required for Faculty (e.g., FAC-CS-042)
  staffId: { type: String, default: null },    // Required for Staff (e.g., STF-ME-012)
  year: { type: String, default: null },       // e.g., "3rd Year"
  semester: { type: String, default: null },   // e.g., "Semester 6"
  designation: { type: String, default: null },// For Faculty/Staff
  isAuthorized: { type: Boolean, default: true },
  avatar: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
