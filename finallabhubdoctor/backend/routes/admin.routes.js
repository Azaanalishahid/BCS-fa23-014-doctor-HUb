const express = require('express');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { getUsers, updateUserRole } = require('../controllers/admin.controller');

const router = express.Router();

router.get('/users', authMiddleware, isAdmin, getUsers);
router.put('/users/:id/role', authMiddleware, isAdmin, updateUserRole);

module.exports = router;