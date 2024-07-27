
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { validateVehicleCreation, validateVehicleUpdate, validateVehicleId, validate } = require('../middleware/vehicleValidation');

router.post('/add', validateVehicleCreation, validate, vehicleController.createVehicle);
router.get('/all', vehicleController.getAllVehicles);
router.get('/get/:id', validateVehicleId, validate, vehicleController.getVehicleById);
router.put('/update/:id', validateVehicleUpdate, validate, vehicleController.updateVehicle);
router.delete('/delete/:id', validateVehicleId, validate, vehicleController.deleteVehicle);
router.get('/getDashboard', vehicleController.getDashboardData);

module.exports = router;