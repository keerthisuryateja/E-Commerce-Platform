const db = require('../config/db');

// Get shipping addresses for the logged-in user
exports.getAddresses = async (req, res) => {
  const userId = req.user.id;

  try {
    const [addresses] = await db.query(
      'SELECT id, user_id, street, city, state, zip FROM addresses WHERE user_id = ?',
      [userId]
    );
    return res.json(addresses);
  } catch (err) {
    console.error('Fetch addresses error:', err);
    return res.status(500).json({ message: 'Failed to fetch addresses' });
  }
};

// Add a new shipping address
exports.addAddress = async (req, res) => {
  const userId = req.user.id;
  const { street, city, state, zip } = req.body;

  if (!street || !city || !state || !zip) {
    return res.status(400).json({ message: 'All address fields (street, city, state, zip) are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO addresses (user_id, street, city, state, zip) VALUES (?, ?, ?, ?, ?)',
      [userId, street, city, state, zip]
    );

    return res.status(201).json({
      message: 'Address added successfully',
      address: {
        id: result.insertId,
        user_id: userId,
        street,
        city,
        state,
        zip
      }
    });
  } catch (err) {
    console.error('Add address error:', err);
    return res.status(500).json({ message: 'Failed to add address' });
  }
};
