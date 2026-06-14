const express = require('express');
const { getHistory, addHistory } = require('../controllers/history.controller');
const { authMiddleware, isDoctor } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getHistory);
router.post('/', authMiddleware, isDoctor, addHistory);
// No PUT or DELETE endpoints as per requirements!

module.exports = router;
