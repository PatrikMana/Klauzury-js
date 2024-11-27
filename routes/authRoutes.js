const express = require('express');
const router = express.Router();
const { checkToken } = require('../middlewares/authMiddleware');

router.get('/verify', checkToken);

module.exports = router;