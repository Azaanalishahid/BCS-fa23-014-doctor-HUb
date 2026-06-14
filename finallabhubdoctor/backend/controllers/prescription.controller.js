const { getDb } = require('../database');

const addPrescription = async (req, res) => {
  try {
    const { appointment_id, patient_id, medicines, notes } = req.body;
    const db = getDb();

    const doctor = await db.get('SELECT * FROM doctors WHERE user_id = ?', [req.user.id]);
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    // Validate appointment belongs to doctor
    const appointment = await db.get('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?', [appointment_id, doctor.id]);
    if (!appointment) return res.status(400).json({ message: 'Invalid appointment' });

    await db.run(
      'INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, medicines, notes) VALUES (?, ?, ?, ?, ?)',
      [appointment_id, doctor.id, patient_id, medicines, notes || null]
    );

    // Also add to medical history automatically
    await db.run(
      'INSERT INTO medical_history (patient_id, doctor_id, record_text) VALUES (?, ?, ?)',
      [patient_id, doctor.id, `Prescription added: ${medicines}. Notes: ${notes || ''}`]
    );

    await db.run('UPDATE appointments SET status = ? WHERE id = ?', ['Completed', appointment_id]);

    res.status(201).json({ message: 'Prescription added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const db = getDb();
    let query = '';
    let params = [];

    if (req.user.role === 'Patient') {
      const patient = await db.get('SELECT * FROM patients WHERE user_id = ?', [req.user.id]);
      query = `
        SELECT p.*, d.specialization, u.name as doctor_name
        FROM prescriptions p
        JOIN doctors d ON p.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE p.patient_id = ?
        ORDER BY p.created_at DESC
      `;
      params = [patient.id];
    } else if (req.user.role === 'Doctor') {
      const doctor = await db.get('SELECT * FROM doctors WHERE user_id = ?', [req.user.id]);
      query = `
        SELECT p.*, pa.blood_group, u.name as patient_name
        FROM prescriptions p
        JOIN patients pa ON p.patient_id = pa.id
        JOIN users u ON pa.user_id = u.id
        WHERE p.doctor_id = ?
        ORDER BY p.created_at DESC
      `;
      params = [doctor.id];
    }

    const prescriptions = await db.all(query, params);
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addPrescription, getPrescriptions };
