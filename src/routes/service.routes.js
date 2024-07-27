const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { validateServiceCreation, validateServiceUpdate, validateServiceId, validate } = require('../middleware/serviceValidation');

router.post('/add', validateServiceCreation, validate, serviceController.createService);
router.get('/all', serviceController.getAllServices);
router.get('/get/:id', validateServiceId, validate, serviceController.getServiceById);
router.put('/update/:id', validateServiceUpdate, validate, serviceController.updateService);
router.delete('/delete/:id', validateServiceId, validate, serviceController.deleteService);

module.exports = router;
