const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Lecture Hall 101"
  roomId: { type: String, required: true, unique: true }, // e.g. "LH-101"
  block: { type: String, required: true }, // e.g. "SF Block", "IB Block", "Mechanical Block", "Auditorium Block"
  capacity: { type: Number, required: true },
  roomType: { type: String, enum: ['classroom', 'lab', 'seminar_hall'], default: 'classroom' },
  amenities: [String], // e.g. ["AV", "Projector", "AC", "Computers"]
  status: { type: String, enum: ['Available', 'Booked', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
