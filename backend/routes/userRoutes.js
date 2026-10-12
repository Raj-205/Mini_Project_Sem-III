const express = require('express');
const router = express.Router();
const { lookupUser } = require('../controllers/splitController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/lookup', lookupUser); // GET /api/v1/users/lookup?username=abc

module.exports = router;
