const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/response/save', userController.saveResponse);

module.exports = router;