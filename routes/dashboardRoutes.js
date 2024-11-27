const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/balance', dashboardController.getBalance);
router.get('/summary', dashboardController.getMonthlySummary);
router.get('/alerts', dashboardController.getAlerts);

module.exports = router;