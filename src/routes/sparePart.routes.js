const express = require('express');
const router = express.Router();
const sparePartController = require('../controllers/sparePart.controller');
const { validateSparePartCreation, validateSparePartUpdate, validateSparePartId, validate, validateCategoryCreation, validateCategoryId, validateCategoryUpdate } = require('../middleware/sparePartValidation');

router.post('/add', validateSparePartCreation, validate, sparePartController.createSparePart);
router.get('/all', sparePartController.getAllSpareParts);
router.get('/get/:id', validateSparePartId, validate, sparePartController.getSparePartById);
router.put('/update/:id', validateSparePartUpdate, validate, sparePartController.updateSparePart);
router.delete('/delete/:id', validateSparePartId, validate, sparePartController.deleteSparePart);

router.post('/add/category', validateCategoryCreation, validate, sparePartController.createCategory);
router.get('/all/category', sparePartController.getAllCategories);
router.get('/get/category/:id', validateCategoryId, validate, sparePartController.getCategoryById);
router.put('/update/category/:id', validateCategoryUpdate, validate, sparePartController.updateCategory);
router.delete('/delete/category/:id', validateCategoryId, validate, sparePartController.deleteCategory);

module.exports = router;