const express = require('express');
const { addPrescription, getPrescriptions } = require('../controllers/prescription.controller');
const { authMiddleware, isDoctor } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, isDoctor, addPrescription);
router.get('/', authMiddleware, getPrescriptions);

module.exports = router;
