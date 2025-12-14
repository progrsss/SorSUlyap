const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;