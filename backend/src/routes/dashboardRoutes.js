const express = require('express');
const router = express.Router();

const { getDashboardAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// Protected analytics dashboard
router.get('/analytics', protect, getDashboardAnalytics);

module.exports = router;
