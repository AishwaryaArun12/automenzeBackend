const Notification = require('../models/notification');

exports.getNotification = async (req, res) => {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .populate('vehicleId')
        .populate('serviceId');
      res.json({ notifications });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
  };

  exports.isRead = async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
      res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
  };