const BookingInitiative = require('../models/BookingInitiative');
const Room = require('../models/Room');

// Create new room booking, detecting overlaps and bypassing approvals for staff/admin
const createBooking = async (req, res) => {
  const { eventName, allocatedRoom, startTime, endTime, targetAudience, allowJoinRequests, createdBy } = req.body;

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // Schedule overlap detection across requested continuous window
    const overlappingBooking = await BookingInitiative.findOne({
      allocatedRoom,
      status: 'APPROVED',
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        message: `Conflict detected with existing booking: "${overlappingBooking.eventName}"` 
      });
    }

    // Bypass approval queue if user role is staff or admin (staff direct allocation)
    const bypassQueue = req.user.role === 'staff' || req.user.role === 'admin';
    const status = bypassQueue ? 'APPROVED' : 'PENDING_STAFF_APPROVAL';

    // Delegation support
    let dept = req.user.department;
    let creatorId = req.user._id;
    let initRole = req.user.role;
    if ((req.user.role === 'admin' || req.user.role === 'staff') && createdBy) {
      const User = require('../models/User');
      const assignedUser = await User.findById(createdBy);
      if (assignedUser) {
        dept = assignedUser.department;
        creatorId = assignedUser._id;
        initRole = assignedUser.role;
      }
    }

    const booking = await BookingInitiative.create({
      eventName,
      allocatedRoom,
      startTime: start,
      endTime: end,
      createdBy: creatorId,
      initiatedByRole: initRole,
      department: dept,
      targetAudience: targetAudience || { type: 'department', groupName: dept },
      allowJoinRequests: !!allowJoinRequests,
      status,
      approvedBy: bypassQueue ? req.user._id : null
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await BookingInitiative.find({})
      .populate('allocatedRoom')
      .populate('createdBy', 'name email role department');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or Reject a booking request (Staff/Admin override)
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'APPROVED' or 'REJECTED'

  try {
    const booking = await BookingInitiative.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking initiative not found' });
    }

    if (status === 'APPROVED') {
      // Overlap checks
      const conflict = await BookingInitiative.findOne({
        allocatedRoom: booking.allocatedRoom,
        status: 'APPROVED',
        _id: { $ne: booking._id },
        $or: [
          { startTime: { $lt: booking.endTime }, endTime: { $gt: booking.startTime } }
        ]
      });

      if (conflict) {
        return res.status(400).json({ 
          message: `Cannot approve. Schedule conflict with: "${conflict.eventName}"` 
        });
      }
    }

    booking.status = status;
    booking.approvedBy = req.user._id;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};
