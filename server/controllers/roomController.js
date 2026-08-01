const Room = require('../models/Room');
const BookingInitiative = require('../models/BookingInitiative');

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get schedule timeline for a room on a specific date (Gantt timeline queries)
const getRoomTimeline = async (req, res) => {
  const { date } = req.query; // YYYY-MM-DD or ISO
  const filterDate = date ? new Date(date) : new Date();
  
  const startOfDay = new Date(filterDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(filterDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const rooms = await Room.find({});
    const bookings = await BookingInitiative.find({
      status: 'APPROVED',
      $or: [
        { startTime: { $gte: startOfDay, $lte: endOfDay } },
        { endTime: { $gte: startOfDay, $lte: endOfDay } },
        { startTime: { $lte: startOfDay }, endTime: { $gte: endOfDay } }
      ]
    }).populate('createdBy', 'name email role department');

    const timelineData = rooms.map(room => {
      const roomBookings = bookings.filter(
        b => b.allocatedRoom.toString() === room._id.toString()
      );
      return {
        ...room.toObject(),
        bookings: roomBookings
      };
    });

    res.json(timelineData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRooms,
  createRoom,
  getRoomTimeline
};
