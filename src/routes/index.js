const express = require('express');
const router = express.Router();
const clientRoutes = require('./client.routes');
const vehicleRoutes = require('./vehicle.routes');
const sparePartRoutes = require('./sparePart.routes')
const serviceRoutes = require('./service.routes')
const notificationRoutes = require('./notification.routes')
const authController = require('../controllers/auth.controller')
const auth = require('../middleware/auth');
const { validateLogin, validate } = require('../middleware/authValidation');

router.use('/clients', auth, clientRoutes);
router.use('/vehicles', auth, vehicleRoutes);
router.use('/login', validateLogin, validate, authController.login);
router.put('/update/token', auth, authController.updateToken);
router.use('/spare', auth, sparePartRoutes);
router.use('/service', auth, serviceRoutes);
router.use('/notification', auth, notificationRoutes)

module.exports = router;