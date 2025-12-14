const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncement);
router.post('/', protect, authorize('Admin', 'Faculty'), upload.array('files', 5), createAnnouncement);
router.put('/:id', protect, authorize('Admin', 'Faculty'), updateAnnouncement);
router.delete('/:id', protect, authorize('Admin', 'Faculty'), deleteAnnouncement);

module.exports = router;
