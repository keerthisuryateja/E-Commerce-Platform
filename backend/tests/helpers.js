/**
 * Test Helpers and Utilities
 * Common functions and mocks for testing
 */

// Mock HTTP Response Helper
class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this._data = null;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this._data = data;
    return this;
  }

  send(data) {
    this._data = data;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  getStatus() {
    return this.statusCode;
  }

  getData() {
    return this._data;
  }
}

// Mock HTTP Request Helper
class MockRequest {
  constructor(options = {}) {
    this.body = options.body || {};
    this.params = options.params || {};
    this.query = options.query || {};
    this.headers = options.headers || {};
    this.user = options.user || null;
    this.method = options.method || 'GET';
    this.url = options.url || '/';
  }
}

// Database Mock Helper
const createMockDatabase = () => {
  const data = {
    users: [
      {
        id: 1,
        email: 'admin@ecommerce.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        id: 2,
        email: 'user@ecommerce.com',
        password: 'user123',
        role: 'user'
      }
    ],
    products: [
      {
        id: 1,
        name: 'Monstera',
        price: 45.99,
        stock: 100,
        description: 'Large leafy plant'
      },
      {
        id: 2,
        name: 'Fern',
        price: 25.99,
        stock: 50,
        description: 'Delicate fern'
      }
    ],
    orders: [],
    orderItems: []
  };

  return {
    query: async (sql, params = []) => {
      // SELECT all users
      if (sql === 'SELECT * FROM users') {
        return [data.users];
      }

      // SELECT user by email and password
      if (sql.includes('SELECT * FROM users WHERE email = ? AND password = ?')) {
        const user = data.users.find(
          u => u.email === params[0] && u.password === params[1]
        );
        return user ? [[user]] : [[]];
      }

      // SELECT all products
      if (sql === 'SELECT * FROM products') {
        return [data.products];
      }

      // INSERT product
      if (sql.includes('INSERT INTO products')) {
        const newId = Math.max(...data.products.map(p => p.id), 0) + 1;
        data.products.push({
          id: newId,
          name: params[0],
          description: params[1],
          price: params[2],
          stock: params[3],
          image_url: params[4]
        });
        return [{ insertId: newId, affectedRows: 1 }];
      }

      // UPDATE product
      if (sql.includes('UPDATE products')) {
        const product = data.products.find(p => p.id === params[params.length - 1]);
        if (!product) return [{ affectedRows: 0 }];
        
        if (sql.includes('stock')) {
          product.stock = params[0];
        } else if (sql.includes('price')) {
          product.price = params[0];
        }
        return [{ affectedRows: 1 }];
      }

      // DELETE product
      if (sql.includes('DELETE FROM products')) {
        const index = data.products.findIndex(p => p.id === params[0]);
        if (index === -1) return [{ affectedRows: 0 }];
        data.products.splice(index, 1);
        return [{ affectedRows: 1 }];
      }

      return [[]];
    },

    reset: () => {
      data.orders = [];
      data.orderItems = [];
    }
  };
};

// JWT Helper
const createMockJWT = () => {
  return {
    sign: (payload, secret, options) => {
      // Mock JWT token
      return 'mock.jwt.token.' + Buffer.from(JSON.stringify(payload)).toString('base64');
    },

    verify: (token, secret) => {
      if (!token || !token.startsWith('mock.jwt.token.')) {
        throw new Error('Invalid token');
      }
      const payload = JSON.parse(Buffer.from(token.split('.')[2], 'base64').toString());
      return payload;
    },

    decode: (token) => {
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(Buffer.from(parts[2], 'base64').toString());
    }
  };
};

// Test Assertion Helpers
const assertions = {
  assertStatusCode: (res, expected) => {
    if (res.getStatus() !== expected) {
      throw new Error(`Expected status ${expected}, got ${res.getStatus()}`);
    }
  },

  assertDataExists: (data) => {
    if (!data) {
      throw new Error('Expected data to exist');
    }
  },

  assertArrayLength: (array, length) => {
    if (!Array.isArray(array) || array.length !== length) {
      throw new Error(`Expected array length ${length}, got ${array?.length || 0}`);
    }
  },

  assertObjectHasProperties: (obj, properties) => {
    for (const prop of properties) {
      if (!(prop in obj)) {
        throw new Error(`Expected object to have property "${prop}"`);
      }
    }
  },

  assertErrorMessage: (data, expectedMessage) => {
    if (!data.message || !data.message.includes(expectedMessage)) {
      throw new Error(`Expected message to include "${expectedMessage}", got "${data.message}"`);
    }
  }
};

// Test Data Generators
const generators = {
  generateUser: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    ...overrides
  }),

  generateProduct: (overrides = {}) => ({
    id: 1,
    name: 'Test Product',
    price: 29.99,
    stock: 10,
    description: 'A test product',
    image_url: 'https://example.com/image.jpg',
    ...overrides
  }),

  generateOrder: (overrides = {}) => ({
    id: 1,
    user_id: 1,
    total_amount: 99.99,
    status: 'Pending',
    created_at: new Date(),
    items: [],
    ...overrides
  }),

  generateOrderItem: (overrides = {}) => ({
    id: 1,
    order_id: 1,
    product_id: 1,
    quantity: 2,
    price: 29.99,
    ...overrides
  })
};

// Setup/Teardown Helpers
const setup = {
  beforeTest: () => {
    global.mockDb = createMockDatabase();
    global.broadcastInventoryUpdate = () => {};
    global.broadcastOrderUpdate = () => {};
  },

  afterTest: () => {
    delete global.mockDb;
    delete global.broadcastInventoryUpdate;
    delete global.broadcastOrderUpdate;
  }
};

// Performance Testing Helper
class PerformanceMonitor {
  constructor() {
    this.marks = {};
  }

  start(name) {
    this.marks[name] = Date.now();
  }

  end(name, maxTime = 1000) {
    const duration = Date.now() - this.marks[name];
    if (duration > maxTime) {
      console.warn(`⚠️  Performance warning: ${name} took ${duration}ms (max: ${maxTime}ms)`);
    }
    return duration;
  }

  getReport() {
    return this.marks;
  }
}

// Export all helpers
module.exports = {
  MockResponse,
  MockRequest,
  createMockDatabase,
  createMockJWT,
  assertions,
  generators,
  setup,
  PerformanceMonitor
};
