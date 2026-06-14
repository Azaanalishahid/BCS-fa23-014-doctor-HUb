const express = require('express');
const { getDoctors, getDoctorSchedule, addClinic } = require('../controllers/doctor.controller');
const { authMiddleware, isDoctor } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getDoctors);
router.get('/schedule/:doctorId', authMiddleware, getDoctorSchedule);
router.post('/clinics', authMiddleware, isDoctor, addClinic);

module.exports = router;
