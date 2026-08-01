const mongoose = require('mongoose');

const bookingInitiativeSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  allocatedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initiatedByRole: { type: String, enum: ['faculty', 'staff', 'admin'], required: true },
  department: { type: String, required: true },
  targetAudience: {
    type: { type: String, enum: ['department', 'custom_group'], required: true },
    groupName: String,
    allowedRollNumbers: [String]
  },
  allowJoinRequests: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['PENDING_STAFF_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING_STAFF_APPROVAL' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  activeOtpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('BookingInitiative', bookingInitiativeSchema);
