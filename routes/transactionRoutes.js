const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');  // Importujeme controller
const { verifyToken } = require('../middlewares/authMiddleware'); // Middleware pro ověření tokenu

// POST endpoint pro přidání transakce
router.post('/addtransaction', verifyToken, transactionController.addTransaction);

module.exports = router;
