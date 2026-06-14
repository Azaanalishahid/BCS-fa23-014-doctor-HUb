const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

const register = async (req, res) => {
  try {
    const { name, email, password, role, ...additionalData } = req.body;
    const db = getDb();

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const userId = result.lastID;

    // Handle role specific tables
    if (role === 'Doctor') {
      await db.run(
        'INSERT INTO doctors (user_id, specialization, treatment_type, fee) VALUES (?, ?, ?, ?)',
        [userId, additionalData.specialization || '', additionalData.treatment_type || 'Allopathic', additionalData.fee || 0]
      );
    } else if (role === 'Patient') {
      await db.run(
        'INSERT INTO patients (user_id, date_of_birth, blood_group) VALUES (?, ?, ?)',
        [userId, additionalData.date_of_birth || null, additionalData.blood_group || '']
      );
    } else if (role === 'Assistant') {
      await db.run(
        'INSERT INTO assistants (user_id, assigned_admin_id) VALUES (?, ?)',
        [userId, additionalData.assigned_admin_id || null]
      );
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    let roleData = {};
    let userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'Patient') {
      const patientData = await db.get('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      if (patientData) {
        userResponse = {
          ...userResponse,
          patient_id: patientData.id,
          date_of_birth: patientData.date_of_birth,
          blood_group: patientData.blood_group
        };
      }
    } else if (user.role === 'Doctor') {
      const doctorData = await db.get('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      if (doctorData) {
        userResponse = {
          ...userResponse,
          doctor_id: doctorData.id,
          specialization: doctorData.specialization,
          treatment_type: doctorData.treatment_type,
          about: doctorData.about,
          fee: doctorData.fee
        };
      }
    }

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.json({ message: 'If that email is registered, we have sent a reset link.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 12);
    await db.run('UPDATE users SET reset_token = ? WHERE id = ?', [resetToken, user.id]);

    // In a real app, send email with this token link. We return the token for demo/testing.
    res.json({ message: 'Password reset token generated. Use the token to reset your password.', resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, forgotPassword };
