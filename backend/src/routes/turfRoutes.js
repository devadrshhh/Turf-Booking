const express = require('express');
const router = express.Router();

const {
  getTurfs,
  getAdminTurfs,
  getTurfById,
  createTurf,
  updateTurf,
  deleteTurf,
  updateAllTurfPrices,
} = require('../controllers/turfController');

const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getTurfs);
router.get('/:id', getTurfById);

// Admin-protected routes
router.get('/admin/all', protect, getAdminTurfs);
router.put('/update-price-all', protect, updateAllTurfPrices);
router.post('/', protect, createTurf);
router.put('/:id', protect, updateTurf);
router.delete('/:id', protect, deleteTurf);

module.exports = router;
