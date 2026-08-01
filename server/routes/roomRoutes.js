const express = require('express');
const { getRooms, createRoom, getRoomTimeline } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getRooms)
  .post(protect, authorize(['admin']), createRoom);

router.get('/timeline', protect, getRoomTimeline);

module.exports = router;
