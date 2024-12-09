const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definice routů pro ověření tokenu
router.get('/verify', authController.verifyToken);

module.exports = router;