const { Router } = require('express');

const router = Router();
const companiesController = require('../controllers/companies.controller');

router.post('/', companiesController.signUp);
router.get('/', companiesController.profile);
router.put('/', companiesController.updateProfile);

module.exports = router;
