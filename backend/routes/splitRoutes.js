const express = require('express');
const router = express.Router();
const { createSplit, getSplits } = require('../controllers/splitController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', createSplit);
router.get('/', getSplits);

module.exports = router;
