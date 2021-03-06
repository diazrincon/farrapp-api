const { Router } = require('express');

const router = Router();
const clientController = require('../controllers/clients.controller');

router.get('/:clientId', clientController.getClientById);
router.get('/', clientController.getClients);
router.post('/follow-establishment', clientController.followEstablishment);
router.post('/event-interest', clientController.interestForEvent);
router.post('/:clientId', clientController.updateClientProfile);
router.post('/', clientController.postClient);

module.exports = router;
