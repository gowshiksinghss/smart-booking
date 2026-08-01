const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingInitiative', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  surveyCompleted: { type: Boolean, default: false },
  surveyAnswers: { type: Map, of: String },
  attendanceStatus: { 
    type: String, 
    enum: ['PRESENT', 'ABSENT', 'PENDING'], 
    default: 'PENDING' 
  },
  verifiedAt: { type: Date, default: null },
  lastUpdatedBy: { type: String, default: 'System' }, // "System (OTP)" or "Staff: Subramanian M"
  overrideReason: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
