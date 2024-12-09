const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');  
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Definice routů pro transakce a měsíční přehled
router.get('/', verifyToken, transactionController.getTransactions);
router.get('/summary', verifyToken, dashboardController.getMonthlySummary);
router.post('/addtransaction', verifyToken, transactionController.addTransaction);

module.exports = router;