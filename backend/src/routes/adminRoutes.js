const express = require('express');
const router = express.Router();

const {
  login,
  logout,
  getMe,
  createAdmin,
  updateAdmin,
  changePassword,
  deleteAdmin,
  getAllAdmins,
} = require('../controllers/adminController');

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  validateLoginInput,
  validateAdminCreateInput,
  validateChangePasswordInput,
} = require('../middlewares/validationMiddleware');

// Public endpoints
router.post('/login', validateLoginInput, login);

// Private endpoints (Require Login)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/all', protect, getAllAdmins);
router.put('/change-password/:id', protect, validateChangePasswordInput, changePassword);

// Super Admin Only endpoints
router.post('/create', protect, authorize('superadmin'), validateAdminCreateInput, createAdmin);
router.put('/update/:id', protect, authorize('superadmin'), updateAdmin);
router.delete('/delete/:id', protect, authorize('superadmin'), deleteAdmin);

module.exports = router;
