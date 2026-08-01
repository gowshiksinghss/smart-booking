const express = require('express');
const { 
  generateOtp, 
  verifyOtpAndCheckIn, 
  overrideAttendance, 
  getSessionAttendance 
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const router = express.Router();

router.post('/otp/generate', protect, authorize(['faculty', 'staff', 'admin']), generateOtp);
router.post('/otp/verify', protect, authorize(['student']), verifyOtpAndCheckIn);
router.post('/override', protect, authorize(['staff', 'admin']), overrideAttendance);
router.get('/session/:bookingId', protect, getSessionAttendance);

module.exports = router;
