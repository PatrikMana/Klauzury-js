const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Definice routů pro získání měsíčního přehledu, která vyžaduje ověření tokenu
router.get('/summary', verifyToken, dashboardController.getMonthlySummary);

module.exports = router;