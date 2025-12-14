const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getAllSchedules);
router.post('/', protect, authorize('Admin', 'Faculty'), upload.single('file'), createSchedule);
router.put('/:id', protect, authorize('Admin', 'Faculty'), updateSchedule);
router.delete('/:id', protect, authorize('Admin', 'Faculty'), deleteSchedule);

module.exports = router;
