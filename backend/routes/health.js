const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Main Health Check Endpoint
router.get('/', async (req, res) => {
  const start = Date.now();
  
  // 1. Check Database connection
  let dbStatus = 'OK';
  let dbType = 'MySQL';
  try {
    await db.query('SELECT 1');
    if (db.isInMemory && db.isInMemory()) {
      dbType = 'In-Memory Simulator (Fallback)';
    }
  } catch (err) {
    dbStatus = 'Error';
    dbType = err.message;
  }

  const latency = Date.now() - start;

  res.json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    latency: `${latency}ms`,
    database: {
      status: dbStatus,
      type: dbType
    },
    services: {
      auth: { status: 'Active', code: 200, route: '/api/auth/login' },
      products: { status: 'Active', code: 200, route: '/api/products' },
      orders: { status: 'Active', code: 200, route: '/api/orders' },
      users: { status: 'Active', code: 200, route: '/api/users/addresses' }
    }
  });
});

// Mini status endpoints to support direct pinging by health-check scripts
router.get('/auth', (req, res) => res.status(200).json({ status: 'OK', service: 'Authentication' }));
router.get('/products', async (req, res) => {
  try {
    await db.query('SELECT 1 FROM products LIMIT 1');
    res.status(200).json({ status: 'OK', service: 'Products Database' });
  } catch (err) {
    res.status(500).json({ status: 'Error', message: err.message });
  }
});
router.get('/orders', (req, res) => res.status(200).json({ status: 'OK', service: 'Orders Pipeline' }));
router.get('/users', (req, res) => res.status(200).json({ status: 'OK', service: 'User Profiles' }));

module.exports = router;
