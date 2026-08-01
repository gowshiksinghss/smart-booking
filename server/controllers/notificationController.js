const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('sender', 'name role')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (req, res) => {
  const { title, message, targetType, targetValue } = req.body;

  try {
    const notification = await Notification.create({
      title,
      message,
      targetType,
      targetValue,
      sender: req.user._id
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  createNotification
};
