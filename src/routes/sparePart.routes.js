const express = require('express');
const router = express.Router();
const sparePartController = require('../controllers/sparePart.controller');
const { validateSparePartCreation, validateSparePartUpdate, validateSparePartId, validate } = require('../middleware/sparePartValidation');

router.post('/add', validateSparePartCreation, validate, sparePartController.createSparePart);
router.get('/all', sparePartController.getAllSpareParts);
router.get('/get/:id', validateSparePartId, validate, sparePartController.getSparePartById);
router.put('/update/:id', validateSparePartUpdate, validate, sparePartController.updateSparePart);
router.delete('/delete/:id', validateSparePartId, validate, sparePartController.deleteSparePart);

module.exports = router;