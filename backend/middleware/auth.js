const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'leaf-green-ecommerce-secret-key';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  // Support easy offline testing with mock tokens
  if (token === 'mock-admin-token') {
    req.user = { id: 1, email: 'admin@ecommerce.com', role: 'admin' };
    return next();
  }
  if (token === 'mock-user-token') {
    req.user = { id: 2, email: 'user@ecommerce.com', role: 'user' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
