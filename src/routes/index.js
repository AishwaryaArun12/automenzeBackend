const express = require('express');
const router = express.Router();
const clientRoutes = require('./client.routes');
const authController = require('../controllers/auth.controller')
const auth = require('../middleware/auth');
const { validateLogin, validate } = require('../middleware/authValidation');

router.use('/clients', auth, clientRoutes);
router.use('/login', validateLogin, validate, authController.login);

module.exports = router;