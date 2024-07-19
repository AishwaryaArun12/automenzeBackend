const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { validateClientCreation, validateClientUpdate, validateClientId, validate } = require('../middleware/clientValidation');

router.post('/add', validateClientCreation, validate, clientController.createClient);
router.get('/all', clientController.getAllClients);
router.get('/get/:id', validateClientId, validate, clientController.getClientById);
router.put('/update/:id', validateClientUpdate, validate, clientController.updateClient);
router.delete('/delete/:id', validateClientId, validate, clientController.deleteClient);

module.exports = router;