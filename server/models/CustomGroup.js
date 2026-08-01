const mongoose = require('mongoose');

const customGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumbers: [{ type: String, required: true }] // e.g. ["21CS001", "21CS045"]
}, { timestamps: true });

module.exports = mongoose.model('CustomGroup', customGroupSchema);
