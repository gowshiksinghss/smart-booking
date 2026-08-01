const express = require('express');
const { getNotifications, createNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize(['faculty', 'staff', 'admin']), createNotification);

module.exports = router;
