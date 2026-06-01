const express = require('express');
const router = express.Router();

const {
  getCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
  applyCoupon,
} = require('../controllers/couponController');

const { protect } = require('../middlewares/authMiddleware');

// Public coupon application endpoint
router.post('/apply', applyCoupon);

// Admin-only endpoints
router.get('/', protect, getCoupons);
router.post('/', protect, createCoupon);
router.put('/toggle/:id', protect, toggleCoupon);
router.delete('/:id', protect, deleteCoupon);

module.exports = router;
