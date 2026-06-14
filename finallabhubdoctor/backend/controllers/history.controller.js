const { getDb } = require('../database');

const getHistory = async (req, res) => {
  try {
    const db = getDb();
    let query = '';
    let params = [];

    if (req.user.role === 'Patient') {
      const patient = await db.get('SELECT * FROM patients WHERE user_id = ?', [req.user.id]);
      query = `
        SELECT h.*, d.specialization, d.treatment_type, u.name as doctor_name
        FROM medical_history h
        JOIN doctors d ON h.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE h.patient_id = ?
        ORDER BY h.created_at DESC
      `;
      params = [patient.id];
    } else if (req.user.role === 'Doctor') {
      const doctor = await db.get('SELECT * FROM doctors WHERE user_id = ?', [req.user.id]);
      // Doctor can get history of a specific patient if needed, but let's say they pass patient_id
      const { patient_id } = req.query;
      if (!patient_id) return res.status(400).json({ message: 'Patient ID required' });
      
      query = `
        SELECT h.*, d.specialization, d.treatment_type, u.name as doctor_name
        FROM medical_history h
        JOIN doctors d ON h.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE h.patient_id = ?
        ORDER BY h.created_at DESC
      `;
      params = [patient_id];
    }

    const history = await db.all(query, params);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addHistory = async (req, res) => {
  try {
    const { patient_id, record_text, file_url } = req.body;
    const db = getDb();

    const doctor = await db.get('SELECT * FROM doctors WHERE user_id = ?', [req.user.id]);
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    await db.run(
      'INSERT INTO medical_history (patient_id, doctor_id, record_text, file_url) VALUES (?, ?, ?, ?)',
      [patient_id, doctor.id, record_text, file_url || null]
    );

    res.status(201).json({ message: 'Medical history record added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getHistory, addHistory };
