const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
    capped: { size: 1024 * 1024, max: 500 } // 1MB size limit, max 500 documents
  });

module.exports = mongoose.model('Notification', notificationSchema);
