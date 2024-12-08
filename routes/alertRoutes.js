const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, alertController.getAlerts);

module.exports = router;