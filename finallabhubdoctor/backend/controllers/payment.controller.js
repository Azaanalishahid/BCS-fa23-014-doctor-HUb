const { getDb } = require('../database');

const uploadPayment = async (req, res) => {
  try {
    const { appointment_id } = req.body;
    const db = getDb();

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a screenshot' });
    }

    const screenshot_url = `/uploads/${req.file.filename}`;

    await db.run(
      'INSERT INTO payments (appointment_id, screenshot_url) VALUES (?, ?)',
      [appointment_id, screenshot_url]
    );

    res.status(201).json({ message: 'Payment screenshot uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const db = getDb();
    
    // Assistant gets pending payments
    const payments = await db.all(`
      SELECT p.*, a.date, a.time, pa.blood_group, u.name as patient_name
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      JOIN patients pa ON a.patient_id = pa.id
      JOIN users u ON pa.user_id = u.id
      WHERE p.verified_by_assistant IS NULL AND a.status = 'Pending'
    `);

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadPayment, getPendingPayments };
