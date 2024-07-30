const Notification = require('../models/notification');

exports.getNotification = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
    
        const notifications = await Notification.find()
          .sort({ createdAt: -1 })
          .populate('vehicleId')
          .populate('serviceId')
          .skip(skip)
          .limit(limit);
    
        const totalCount = await Notification.countDocuments();
    
        res.json({
          notifications,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        });
      } catch (error) {
        next(error);
      }
  };

  exports.isRead = async (req, res, next) => {
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
  exports.getCount = async (req, res, next) => {
    try {
      const count = await Notification.countDocuments({ read: false });
      res.json({ notificationCount: count });
    } catch (error) {
        next(error)    }
  };