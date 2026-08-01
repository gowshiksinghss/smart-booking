const JoinRequest = require('../models/JoinRequest');
const BookingInitiative = require('../models/BookingInitiative');
const AttendanceLog = require('../models/AttendanceLog');

// Create a join request for a student to join an unlisted session
const createJoinRequest = async (req, res) => {
  const { bookingId, reasonNote } = req.body;
  const studentId = req.user._id;

  try {
    const booking = await BookingInitiative.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking session not found' });
    }

    if (!booking.allowJoinRequests) {
      return res.status(400).json({ message: 'Join requests are not allowed for this session' });
    }

    const existing = await JoinRequest.findOne({ bookingId, studentId });
    if (existing) {
      return res.status(400).json({ message: 'Join request already submitted' });
    }

    const request = await JoinRequest.create({
      bookingId,
      studentId,
      reasonNote,
      status: 'PENDING'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve all pending join requests for a booking
const getJoinRequests = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const requests = await JoinRequest.find({ bookingId, status: 'PENDING' })
      .populate('studentId', 'name email rollNumber department year semester');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status (Staff / Faculty Approve or Reject)
const updateJoinRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'APPROVED' or 'REJECTED'

  try {
    const request = await JoinRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    await request.save();

    if (status === 'APPROVED') {
      // Add student to the AttendanceLog roster so they show up in lists
      await AttendanceLog.findOneAndUpdate(
        { bookingId: request.bookingId, studentId: request.studentId },
        { attendanceStatus: 'PENDING', lastUpdatedBy: 'Join Request Approved' },
        { upsert: true, new: true }
      );
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJoinRequest,
  getJoinRequests,
  updateJoinRequestStatus
};
