const express = require('express');
const router = express.Router();

const { getPayments, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Public verification endpoint
router.post('/verify', verifyPayment);

// Admin-only ledger details
router.get('/', protect, getPayments);

module.exports = router;
