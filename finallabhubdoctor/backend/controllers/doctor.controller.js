const { getDb } = require('../database');

const getDoctors = async (req, res) => {
  try {
    const { disease, treatment_type } = req.query;
    const db = getDb();

    let query = `
      SELECT d.*, u.name, u.email 
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.role = 'Doctor'
    `;
    const params = [];

    if (disease) {
      // Simple like search in specialization for disease filtering
      query += ` AND (d.specialization LIKE ? OR d.about LIKE ?)`;
      params.push(`%${disease}%`, `%${disease}%`);
    }

    if (treatment_type) {
      query += ` AND d.treatment_type = ?`;
      params.push(treatment_type);
    }

    const doctors = await db.all(query, params);
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const db = getDb();

    const clinics = await db.all('SELECT * FROM clinics WHERE doctor_id = ?', [doctorId]);
    
    const appointments = await db.all('SELECT date, time, status FROM appointments WHERE doctor_id = ? AND status != "Cancelled"', [doctorId]);

    res.json({ clinics, booked_appointments: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addClinic = async (req, res) => {
  try {
    const { clinic_name, address, start_time, end_time } = req.body;
    const db = getDb();

    const doctor = await db.get('SELECT * FROM doctors WHERE user_id = ?', [req.user.id]);
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    await db.run(
      'INSERT INTO clinics (doctor_id, clinic_name, address, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [doctor.id, clinic_name, address, start_time, end_time]
    );

    res.status(201).json({ message: 'Clinic availability added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDoctors, getDoctorSchedule, addClinic };
