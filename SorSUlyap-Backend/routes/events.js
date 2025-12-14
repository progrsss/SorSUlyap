const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('Admin', 'Faculty'), createEvent);
router.put('/:id', protect, authorize('Admin', 'Faculty'), updateEvent);
router.delete('/:id', protect, authorize('Admin', 'Faculty'), deleteEvent);

module.exports = router;
