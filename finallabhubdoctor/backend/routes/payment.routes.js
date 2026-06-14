const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadPayment, getPendingPayments } = require('../controllers/payment.controller');
const { authMiddleware, isAssistant } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('screenshot'), uploadPayment);
router.get('/pending', authMiddleware, isAssistant, getPendingPayments);

module.exports = router;
