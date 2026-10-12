const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markRead, acceptSplit, declineSplit } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.post('/:id/accept', acceptSplit);
router.post('/:id/decline', declineSplit);

module.exports = router;
