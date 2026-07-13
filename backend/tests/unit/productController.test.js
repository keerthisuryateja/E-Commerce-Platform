const productController = require('../../controllers/productController');

// Mock database
const mockData = {
  products: [
    { id: 1, name: 'Monstera', price: 45.99, stock: 10, description: 'Large plant', image_url: 'url' },
    { id: 2, name: 'Fern', price: 25.99, stock: 5, description: 'Delicate fern', image_url: 'url' }
  ]
};

// Mock DB module
const mockDb = {
  query: async (sql, params) => {
    // GET all products
    if (sql === 'SELECT * FROM products') {
      return [mockData.products];
    }

    // UPDATE stock
    if (sql.includes('UPDATE products SET stock = ?')) {
      const productId = params[1];
      const product = mockData.products.find(p => p.id === productId);
      if (!product) return [{ affectedRows: 0 }];
      product.stock = params[0];
      return [{ affectedRows: 1 }];
    }

    // UPDATE price
    if (sql.includes('UPDATE products SET price = ?')) {
      const productId = params[1];
      const product = mockData.products.find(p => p.id === productId);
      if (!product) return [{ affectedRows: 0 }];
      product.price = params[0];
      return [{ affectedRows: 1 }];
    }

    // INSERT product
    if (sql.includes('INSERT INTO products')) {
      const newId = Math.max(...mockData.products.map(p => p.id)) + 1;
      mockData.products.push({
        id: newId,
        name: params[0],
        description: params[1],
        price: params[2],
        stock: params[3],
        image_url: params[4]
      });
      return [{ insertId: newId }];
    }

    // DELETE product
    if (sql.includes('DELETE FROM products')) {
      const productId = params[0];
      const index = mockData.products.findIndex(p => p.id === productId);
      if (index === -1) return [{ affectedRows: 0 }];
      mockData.products.splice(index, 1);
      return [{ affectedRows: 1 }];
    }

    return [[]];
  }
};

// Test suite
const tests = {
  'Get all products': async () => {
    const req = {};
    let responseData = null;
    const res = {
      json: function(data) {
        responseData = data;
      }
    };
    await productController.getAllProducts(req, res);
    if (!Array.isArray(responseData) || responseData.length === 0) {
      throw new Error('Should return array of products');
    }
    console.log(`✓ Retrieved ${responseData.length} products`);
  },

  'Update product stock with valid value': async () => {
    const req = {
      params: { id: '1' },
      body: { stock: 20 }
    };
    let statusCode = 200;
    const res = {
      json: function(data) {
        if (data.stock !== 20) throw new Error('Stock not updated correctly');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.updateStock(req, res);
    console.log('✓ Product stock updated successfully');
  },

  'Update product stock with negative value': async () => {
    const req = {
      params: { id: '1' },
      body: { stock: -5 }
    };
    let statusCode = null;
    const res = {
      json: () => {},
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.updateStock(req, res);
    if (statusCode !== 400) throw new Error('Expected 400 for negative stock');
    console.log('✓ Negative stock validation works');
  },

  'Update product stock with invalid type': async () => {
    const req = {
      params: { id: '1' },
      body: { stock: 'invalid' }
    };
    let statusCode = null;
    const res = {
      json: () => {},
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.updateStock(req, res);
    if (statusCode !== 400) throw new Error('Expected 400 for invalid stock type');
    console.log('✓ Invalid stock type validation works');
  },

  'Update product price with valid value': async () => {
    const req = {
      params: { id: '2' },
      body: { price: 35.99 }
    };
    let statusCode = 200;
    const res = {
      json: function(data) {
        if (data.price !== 35.99) throw new Error('Price not updated correctly');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.updatePrice(req, res);
    console.log('✓ Product price updated successfully');
  },

  'Update price with negative value': async () => {
    const req = {
      params: { id: '1' },
      body: { price: -10 }
    };
    let statusCode = null;
    const res = {
      json: () => {},
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.updatePrice(req, res);
    if (statusCode !== 400) throw new Error('Expected 400 for negative price');
    console.log('✓ Negative price validation works');
  },

  'Create new product': async () => {
    const req = {
      body: {
        name: 'Pothos',
        description: 'Climbing vine',
        price: 19.99,
        stock: 15,
        image_url: 'url.jpg'
      }
    };
    let statusCode = null;
    const res = {
      json: function(data) {
        if (!data.product || !data.product.id) throw new Error('Product not created');
        if (data.product.name !== 'Pothos') throw new Error('Product name mismatch');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.createProduct(req, res);
    if (statusCode !== 201) throw new Error('Expected 201 status');
    console.log('✓ Product created successfully');
  },

  'Create product with missing name': async () => {
    const req = {
      body: { price: 19.99, stock: 10 }
    };
    let statusCode = null;
    const res = {
      json: () => {},
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.createProduct(req, res);
    if (statusCode !== 400) throw new Error('Expected 400 for missing name');
    console.log('✓ Missing product name validation works');
  },

  'Delete product': async () => {
    const req = {
      params: { id: '1' }
    };
    let statusCode = 200;
    const res = {
      json: function(data) {
        if (!data.message.includes('deleted')) throw new Error('Unexpected response');
      },
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.deleteProduct(req, res);
    console.log('✓ Product deleted successfully');
  },

  'Delete non-existent product': async () => {
    const req = {
      params: { id: '999' }
    };
    let statusCode = null;
    const res = {
      json: () => {},
      status: function(code) {
        statusCode = code;
        return this;
      }
    };
    await productController.deleteProduct(req, res);
    if (statusCode !== 404) throw new Error('Expected 404 for non-existent product');
    console.log('✓ Non-existent product deletion rejection works');
  }
};

// Run all tests
async function runTests() {
  console.log('\n=== Product Controller Unit Tests ===\n');
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
