const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/verify', authController.verifyToken);

module.exports = router;