const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/activate/:code', deviceController.activateDevice);
router.post('/response/save', deviceController.saveResponse);

module.exports = router;