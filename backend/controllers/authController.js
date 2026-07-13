const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'leaf-green-ecommerce-secret-key';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Look up user in database (handles simulator or MySQL pool)
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials. Please use default credentials.' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

exports.signup = (req, res) => {
  // Signup is disabled for this read-only showcase application
  return res.status(403).json({
    message: 'Signup is in read-only showcase mode. No new users can be registered.'
  });
};
