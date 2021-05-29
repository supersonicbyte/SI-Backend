const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/activate/:code', deviceController.activateDevice);

module.exports = router;