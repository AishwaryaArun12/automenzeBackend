const Notification = require('../models/notification');

exports.getNotification = async (req, res) => {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .populate('vehicleId')
        .populate('serviceId');
      res.json({ notifications });
    } catch (error) {
        next(error)    }
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
        next(error)    }
  };
  exports.getCount = async (req, res) => {
    try {
      const count = await Notification.countDocuments({ read: false });
      res.json({ notificationCount: count });
    } catch (error) {
        next(error)    }
  };