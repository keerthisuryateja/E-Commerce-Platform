const jwt = require('jsonwebtoken');
const authController = require('../../controllers/authController');

// Mock database
const mockDb = {
  query: async (sql, params) => {
    // Mock successful login
    if (sql.includes('SELECT * FROM users WHERE email = ? AND password = ?')) {
      if (params[0] === 'admin@ecommerce.com' && params[1] === 'admin123') {
        return [[{ id: 1, email: 'admin@ecommerce.com', role: 'admin' }]];
      }
      if (params[0] === 'user@ecommerce.com' && params[1] === 'user123') {
        return [[{ id: 2, email: 'user@ecommerce.com', role: 'user' }]];
      }
      // Invalid credentials
      return [[]];
    }
    return [[]];
  }
};

// Test suite
const tests = {
  'Login with valid admin credentials': async () => {
    const req = {
      body: { email: 'admin@ecommerce.com', password: 'admin123' }
    };
    const res = {
      json: function(data) {
        if (!data.token) throw new Error('Token not generated');
        const decoded = jwt.decode(data.token);
        if (decoded.email !== 'admin@ecommerce.com' || decoded.role !== 'admin') {
          throw new Error('Token payload incorrect');
        }
        console.log('✓ Admin login successful with token');
      },
      status: function(code) {
        return this;
      }
    };
    await authController.login(req, res);
  },

  'Login with valid user credentials': async () => {
    const req = {
      body: { email: 'user@ecommerce.com', password: 'user123' }
    };
    const res = {
      json: function(data) {
        if (!data.token) throw new Error('Token not generated');
        const decoded = jwt.decode(data.token);
        if (decoded.email !== 'user@ecommerce.com' || decoded.role !== 'user') {
          throw new Error('Token payload incorrect');
        }
        console.log('✓ User login successful with token');
      },
      status: function(code) {
        return this;
      }
    };
    await authController.login(req, res);
  },

  'Login with missing email': async () => {
    const req = {
      body: { password: 'admin123' }
    };
    let errorCaught = false;
    const res = {
      json: () => {},
      status: function(code) {
        if (code === 400) errorCaught = true;
        return this;
      }
    };
    await authController.login(req, res);
    if (!errorCaught) throw new Error('Expected 400 status for missing email');
    console.log('✓ Missing email validation works');
  },

  'Login with missing password': async () => {
    const req = {
      body: { email: 'admin@ecommerce.com' }
    };
    let errorCaught = false;
    const res = {
      json: () => {},
      status: function(code) {
        if (code === 400) errorCaught = true;
        return this;
      }
    };
    await authController.login(req, res);
    if (!errorCaught) throw new Error('Expected 400 status for missing password');
    console.log('✓ Missing password validation works');
  },

  'Login with invalid credentials': async () => {
    const req = {
      body: { email: 'wrong@email.com', password: 'wrongpassword' }
    };
    let statusCode = null;
    const res = {
      json: () => {},
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await authController.login(req, res);
    if (statusCode !== 401) throw new Error('Expected 401 status for invalid credentials');
    console.log('✓ Invalid credentials rejection works');
  },

  'Signup is disabled': async () => {
    const req = { body: {} };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.message.includes('read-only')) throw new Error('Expected read-only message');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await authController.signup(req, res);
    if (statusCode !== 403) throw new Error('Expected 403 status for disabled signup');
    console.log('✓ Signup disabled verification works');
  }
};

// Run all tests
async function runTests() {
  console.log('\n=== Auth Controller Unit Tests ===\n');
  let passed = 0;
  let failed = 0;

  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      await testFn();
      passed++;
    } catch (error) {
      console.error(`✗ ${testName}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  runTests();
}

module.exports = tests;
