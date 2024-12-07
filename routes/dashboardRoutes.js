const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/balance', verifyToken, dashboardController.getBalance);
router.get('/summary', verifyToken, dashboardController.getMonthlySummary);
router.get('/alerts', verifyToken, dashboardController.getAlerts);

module.exports = router;