const express = require('express');
const { sendMessage, getMessages } = require('../controllers/communication.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/message', authMiddleware, sendMessage);
router.get('/messages/:userId', authMiddleware, getMessages);

module.exports = router;
