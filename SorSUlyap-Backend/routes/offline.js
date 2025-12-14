const express = require('express');
const router = express.Router();
const {
  syncData,
  queueAction,
  checkStatus
} = require('../controllers/offlineController');
const { protect } = require('../middleware/auth');

router.post('/sync', protect, syncData);
router.post('/queue', protect, queueAction);
router.get('/status', checkStatus);

module.exports = router;