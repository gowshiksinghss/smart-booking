const BookingInitiative = require('../models/BookingInitiative');
const AttendanceLog = require('../models/AttendanceLog');

// Generate 6-digit OTP code for staff/faculty initiated booking session
const generateOtp = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await BookingInitiative.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking session not found' });
    }

    // Only session owner, department staff, or admin can trigger OTP session
    const isOwner = booking.createdBy.toString() === req.user._id.toString();
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ message: 'Not authorized to generate OTP for this session' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry window

    booking.activeOtpCode = otpCode;
    booking.otpExpiresAt = expiresAt;
    await booking.save();

    res.json({
      message: 'Live OTP session generated successfully',
      otpCode,
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP and check in student attendance
const verifyOtpAndCheckIn = async (req, res) => {
  const { bookingId, otpCode, surveyAnswers } = req.body;
  const studentId = req.user._id;

  try {
    const booking = await BookingInitiative.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking session not found' });
    }

    if (!booking.activeOtpCode || booking.activeOtpCode !== otpCode) {
      return res.status(400).json({ message: 'Invalid or missing OTP code' });
    }

    if (new Date() > new Date(booking.otpExpiresAt)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    let log = await AttendanceLog.findOne({ bookingId, studentId });
    if (!log) {
      log = new AttendanceLog({
        bookingId,
        studentId
      });
    }

    log.attendanceStatus = 'PRESENT';
    log.surveyCompleted = true;
    log.surveyAnswers = surveyAnswers;
    log.verifiedAt = new Date();
    log.lastUpdatedBy = 'System (OTP)';
    
    await log.save();

    res.json({
      message: 'Attendance checked in successfully',
      log
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin & Staff manual override privileges
const overrideAttendance = async (req, res) => {
  const { bookingId, studentId, attendanceStatus, overrideReason } = req.body;

  try {
    let log = await AttendanceLog.findOne({ bookingId, studentId });
    if (!log) {
      log = new AttendanceLog({
        bookingId,
        studentId
      });
    }

    log.attendanceStatus = attendanceStatus; // PRESENT, ABSENT, PENDING
    log.overrideReason = overrideReason;
    log.lastUpdatedBy = `${req.user.role.toUpperCase()}: ${req.user.name}`;
    log.verifiedAt = new Date();
    await log.save();

    res.json({
      message: 'Attendance override saved successfully',
      log
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch attendance logs for a specific booking
const getSessionAttendance = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const logs = await AttendanceLog.find({ bookingId })
      .populate('studentId', 'name email rollNumber department year semester');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateOtp,
  verifyOtpAndCheckIn,
  overrideAttendance,
  getSessionAttendance
};
