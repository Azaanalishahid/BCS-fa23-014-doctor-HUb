const express = require('express');
const { createAppointment, verifyAppointment, getAppointments } = require('../controllers/appointment.controller');
const { authMiddleware, isAssistant } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointments);
router.put('/verify/:id', authMiddleware, isAssistant, verifyAppointment);
router.delete('/reject/:id', authMiddleware, isAssistant, require('../controllers/appointment.controller').rejectAppointment);

module.exports = router;
