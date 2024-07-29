const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.get('/all', notificationController.getNotification);
router.put('/read/:id', notificationController.isRead)

module.exports = router;