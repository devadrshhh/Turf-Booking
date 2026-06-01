const express = require('express');
const router = express.Router();

const {
  getBookings,
  getSlotsAvailable,
  createBooking,
  cancelBooking,
  exportBookings,
  markBookingAsPaid,
  lookupBookingById,
  verifyBookingTicket,
} = require('../controllers/bookingController');

const { protect } = require('../middlewares/authMiddleware');

// Public endpoints
router.get('/slots-available', getSlotsAvailable);
router.post('/', createBooking);

// Protected administrative endpoints
router.get('/', protect, getBookings);
router.get('/export', protect, exportBookings);
router.get('/lookup/:bookingId', protect, lookupBookingById);
router.put('/cancel/:id', protect, cancelBooking);
router.put('/mark-paid/:id', protect, markBookingAsPaid);
router.put('/verify/:id', protect, verifyBookingTicket);

module.exports = router;
