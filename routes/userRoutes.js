const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Definice routů pro uživatele
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/balance', verifyToken, userController.getUserBalance);
router.post('/update-balance', verifyToken, userController.updateBalance);
router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;