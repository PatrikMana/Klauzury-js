const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');  // Importujeme controller pro transakce
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');  // Importujeme middleware pro ověření tokenu

// POST endpoint pro přidání transakce
router.get('/', verifyToken, transactionController.getTransactions);
router.get('/summary', verifyToken, dashboardController.getMonthlySummary);
router.post('/addtransaction', verifyToken, transactionController.addTransaction);

module.exports = router;