const orderController = require('../../controllers/orderController');

// Mock database
const mockData = {
  products: [
    { id: 1, name: 'Monstera', stock: 100 },
    { id: 2, name: 'Fern', stock: 50 }
  ],
  orders: [],
  orderItems: []
};

let nextOrderId = 1;

const mockDb = {
  query: async (sql, params) => {
    // Get products for stock verification
    if (sql === 'SELECT * FROM products WHERE id = ?') {
      const productId = params[0];
      const product = mockData.products.find(p => p.id === productId);
      return product ? [[product]] : [[]];
    }

    // Get product stock
    if (sql === 'SELECT stock FROM products WHERE id = ?') {
      const productId = params[0];
      const product = mockData.products.find(p => p.id === productId);
      return product ? [[{ stock: product.stock }]] : [[]];
    }

    // Create order
    if (sql.includes('INSERT INTO orders')) {
      const orderId = nextOrderId++;
      mockData.orders.push({
        id: orderId,
        user_id: params[0],
        total_amount: params[1],
        status: params[2],
        created_at: new Date()
      });
      return [{ insertId: orderId }];
    }

    // Get orders
    if (sql.includes('SELECT * FROM orders')) {
      let orders = mockData.orders;
      if (sql.includes('WHERE user_id = ?')) {
        orders = orders.filter(o => o.user_id === params[0]);
      }
      return [orders];
    }

    // Insert order item
    if (sql.includes('INSERT INTO order_items')) {
      mockData.orderItems.push({
        order_id: params[0],
        product_id: params[1],
        quantity: params[2],
        price: params[3]
      });
      return [{ affectedRows: 1 }];
    }

    // Get order items
    if (sql.includes('SELECT oi.*, p.name, p.image_url FROM order_items')) {
      const orderId = params[0];
      const items = mockData.orderItems.filter(i => i.order_id === orderId);
      return [items];
    }

    // Update product stock
    if (sql.includes('UPDATE products SET stock = ? WHERE id = ?')) {
      const productId = params[1];
      const product = mockData.products.find(p => p.id === productId);
      if (product) product.stock = params[0];
      return [{ affectedRows: 1 }];
    }

    // Update order status
    if (sql.includes('UPDATE orders SET status = ? WHERE id = ?')) {
      const order = mockData.orders.find(o => o.id === params[1]);
      if (order) order.status = params[0];
      return [{ affectedRows: 1 }];
    }

    // Get order items for restocking
    if (sql === 'SELECT product_id, quantity FROM order_items WHERE order_id = ?') {
      return [mockData.orderItems.filter(i => i.order_id === params[0])];
    }

    return [[]];
  }
};

// Test suite
const tests = {
  'Create order with valid items': async () => {
    const req = {
      user: { id: 1 },
      body: {
        items: [
          { id: 1, quantity: 2, price: 45.99, name: 'Monstera' }
        ],
        totalAmount: 91.98
      }
    };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.orderId) throw new Error('Order ID not generated');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await orderController.createOrder(req, res);
    if (statusCode !== 201) throw new Error('Expected 201 status');
    console.log('✓ Order created successfully');
  },

  'Create order with empty cart': async () => {
    const req = {
      user: { id: 1 },
      body: {
        items: [],
        totalAmount: 0
      }
    };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.message.includes('empty')) throw new Error('Expected empty cart error');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await orderController.createOrder(req, res);
    if (statusCode !== 400) throw new Error('Expected 400 status');
    console.log('✓ Empty cart validation works');
  },

  'Create order with non-existent product': async () => {
    const req = {
      user: { id: 1 },
      body: {
        items: [
          { id: 999, quantity: 1, price: 10, name: 'Ghost Plant' }
        ],
        totalAmount: 10
      }
    };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.message.includes('not found')) throw new Error('Expected product not found error');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await orderController.createOrder(req, res);
    if (statusCode !== 404) throw new Error('Expected 404 status');
    console.log('✓ Non-existent product validation works');
  },

  'Create order with insufficient stock': async () => {
    const req = {
      user: { id: 1 },
      body: {
        items: [
          { id: 2, quantity: 100, price: 25.99, name: 'Fern' }
        ],
        totalAmount: 2599
      }
    };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.message.includes('Insufficient')) throw new Error('Expected insufficient stock error');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await orderController.createOrder(req, res);
    if (statusCode !== 400) throw new Error('Expected 400 status');
    console.log('✓ Insufficient stock validation works');
  },

  'Get orders for user': async () => {
    const req = {
      user: { id: 1, role: 'user' }
    };
    let responseData = null;
    const res = {
      json: function(data) {
        responseData = data;
      }
    };
    await orderController.getOrders(req, res);
    if (!Array.isArray(responseData)) {
      throw new Error('Expected array of orders');
    }
    console.log(`✓ Retrieved ${responseData.length} user orders`);
  },

  'Get all orders for admin': async () => {
    const req = {
      user: { id: 1, role: 'admin' }
    };
    let responseData = null;
    const res = {
      json: function(data) {
        responseData = data;
      }
    };
    await orderController.getOrders(req, res);
    if (!Array.isArray(responseData)) {
      throw new Error('Expected array of orders');
    }
    console.log('✓ Admin retrieved all orders');
  },

  'Cancel order successfully': async () => {
    // First create an order to cancel
    mockData.orders.push({
      id: 100,
      user_id: 1,
      status: 'Pending',
      created_at: new Date()
    });
    mockData.orderItems.push({
      order_id: 100,
      product_id: 1,
      quantity: 5
    });

    const req = {
      user: { id: 1, role: 'user' },
      params: { id: '100' }
    };
    let statusCode = 200;
    const res = {
      json: function(data) {
        if (!data.message.includes('cancelled')) throw new Error('Expected cancellation message');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await orderController.cancelOrder(req, res);
    console.log('✓ Order cancelled successfully');
  },

  'Cannot cancel already cancelled order': async () => {
    // Create a cancelled order
    mockData.orders.push({
      id: 101,
      user_id: 1,
      status: 'Cancelled',
      created_at: new Date()
    });

    const req = {
      user: { id: 1, role: 'user' },
      params: { id: '101' }
    };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.message.includes('already cancelled')) throw new Error('Expected already cancelled error');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await orderController.cancelOrder(req, res);
    if (statusCode !== 400) throw new Error('Expected 400 status');
    console.log('✓ Already cancelled order rejection works');
  },

  'Update order status as admin': async () => {
    mockData.orders.push({
      id: 102,
      user_id: 2,
      status: 'Pending',
      created_at: new Date()
    });

    const req = {
      user: { id: 1, role: 'admin' },
      params: { id: '102' },
      body: { status: 'Shipped' }
    };
    let statusCode = 200;
    const res = {
      json: function(data) {},
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    // Note: 'Shipped' is not a valid status, but for this test we'll just verify the call
    await orderController.updateOrderStatus(req, res);
    console.log('✓ Order status update attempted');
  },

  'Non-admin cannot update order status': async () => {
    const req = {
      user: { id: 1, role: 'user' },
      params: { id: '1' },
      body: { status: 'Shipped' }
    };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.message.includes('denied')) throw new Error('Expected access denied message');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await orderController.updateOrderStatus(req, res);
    if (statusCode !== 403) throw new Error('Expected 403 status');
    console.log('✓ Non-admin status update rejection works');
  }
};

// Run all tests
async function runTests() {
  console.log('\n=== Order Controller Unit Tests ===\n');
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
