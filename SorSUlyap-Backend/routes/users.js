const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  changePassword,
  deactivateUser,
  activateUser,
  approveUser,
  denyUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Admin'), getAllUsers);
router.get('/:id', protect, authorize('Admin'), getUserById);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/:id/deactivate', protect, authorize('Admin'), deactivateUser);
router.put('/:id/activate', protect, authorize('Admin'), activateUser);
router.put('/:id/approve', protect, authorize('Admin'), approveUser);
router.put('/:id/deny', protect, authorize('Admin'), denyUser);

module.exports = router;
