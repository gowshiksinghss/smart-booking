const express = require('express');
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const { createJoinRequest, getJoinRequests, updateJoinRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, authorize(['faculty', 'staff', 'admin']), createBooking)
  .get(protect, getBookings);

router.route('/:id/status')
  .patch(protect, authorize(['staff', 'admin']), updateBookingStatus);

// Join Requests Sub-resource routes
router.route('/:bookingId/requests')
  .post(protect, authorize(['student']), createJoinRequest)
  .get(protect, authorize(['faculty', 'staff', 'admin']), getJoinRequests);

router.route('/requests/:id')
  .patch(protect, authorize(['faculty', 'staff', 'admin']), updateJoinRequestStatus);

module.exports = router;
