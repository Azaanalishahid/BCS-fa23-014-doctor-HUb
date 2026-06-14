const { getDb } = require('../database');

const createAppointment = async (req, res) => {
  try {
    const { doctor_id, date, time } = req.body;
    const db = getDb();

    // Only Patient can book
    if (req.user.role !== 'Patient') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }

    const patient = await db.get('SELECT * FROM patients WHERE user_id = ?', [req.user.id]);
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const result = await db.run(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)',
      [patient.id, doctor_id, date, time, 'Pending']
    );

    res.status(201).json({ message: 'Appointment created successfully', appointmentId: result.lastID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const db = getDb();
    let query = '';
    let params = [];

    if (req.user.role === 'Patient') {
      const patient = await db.get('SELECT * FROM patients WHERE user_id = ?', [req.user.id]);
      query = `
        SELECT a.*, d.specialization, u.name as doctor_name, u.id as doctor_user_id
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE a.patient_id = ?
      `;
      params = [patient.id];
    } else if (req.user.role === 'Doctor') {
      const doctor = await db.get('SELECT * FROM doctors WHERE user_id = ?', [req.user.id]);
      query = `
        SELECT a.*, p.blood_group, u.name as patient_name, u.id as patient_user_id
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE a.doctor_id = ?
      `;
      params = [doctor.id];
    } else if (req.user.role === 'Assistant' || req.user.role === 'Admin' || req.user.role === 'Super Admin') {
      query = `
        SELECT a.*, p.blood_group, up.name as patient_name, ud.name as doctor_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
      `;
    }

    const appointments = await db.all(query, params);
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    await db.run('UPDATE appointments SET status = ?, payment_verified = ? WHERE id = ?', ['Confirmed', 1, id]);
    
    // Log the verification
    await db.run('UPDATE payments SET verified_by_assistant = ?, verified_at = CURRENT_TIMESTAMP WHERE appointment_id = ?', [req.user.id, id]);

    res.json({ message: 'Appointment verified and confirmed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    // Delete the payment associated with this appointment
    await db.run('DELETE FROM payments WHERE appointment_id = ?', [id]);
    
    // Appointment remains 'Pending' but without a payment uploaded

    res.json({ message: 'Payment rejected. Patient needs to re-upload.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createAppointment, getAppointments, verifyAppointment, rejectAppointment };
