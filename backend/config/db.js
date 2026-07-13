const mysql = require('mysql2/promise');
require('dotenv').config();

// In-Memory Database Simulator for zero-config fallback
class InMemoryDatabase {
  constructor() {
    console.log('⚠️  Using In-Memory Database Simulator (Fallback Mode)');
    this.users = [
      { id: 1, email: 'admin@ecommerce.com', password: 'admin123', role: 'admin' },
      { id: 2, email: 'user@ecommerce.com', password: 'user123', role: 'user' }
    ];
    this.addresses = [
      { id: 1, user_id: 2, street: '123 Leafy Lane', city: 'Greenwood', state: 'Forest', zip: '98765' }
    ];
    this.products = [
      { id: 1, name: 'Fiddle Leaf Fig', description: 'Premium indoor air purifying tree with glossy green leaves.', price: 45.00, stock: 15, image_url: '/assets/fiddle.jpg' },
      { id: 2, name: 'Monstera Deliciosa', description: 'Stunning Swiss cheese plant featuring split heart-shaped leaves.', price: 32.50, stock: 8, image_url: '/assets/Monstera Delociosa.jpg' },
      { id: 3, name: 'Snake Plant', description: 'Extremely resilient succulent ideal for low light and beginners.', price: 19.99, stock: 25, image_url: '/assets/Snake Plant.jpg' },
      { id: 4, name: 'Golden Pothos', description: 'Lush trailing vine with beautiful heart-shaped green and yellow leaves.', price: 14.50, stock: 12, image_url: '/assets/Golden Pothos.jpeg' },
      { id: 5, name: 'Echeveria Succulent', description: 'Beautiful rose-shaped succulent with soft dusty green leaves.', price: 8.99, stock: 40, image_url: '/assets/Echeveria Succulent.jpg' },
      { id: 6, name: 'Boston Fern', description: 'Feathery light green fronds that thrive in humid environments.', price: 22.00, stock: 10, image_url: '/assets/Boston Fern.jpg' }
    ];
    this.orders = [
      { id: 1, user_id: 2, status: 'Pending', total_amount: 52.49, created_at: new Date().toISOString() }
    ];
    this.orderItems = [
      { id: 1, order_id: 1, product_id: 2, quantity: 1, price: 32.50 },
      { id: 2, order_id: 1, product_id: 3, quantity: 1, price: 19.99 }
    ];
  }

  async query(sql, params = []) {
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    
    // Developer diagnostics / Health checks
    if (cleanSql === 'SELECT 1') {
      return [[{ '1': 1 }], null];
    }
    if (cleanSql === 'SELECT 1 FROM products LIMIT 1') {
      return [[{ '1': 1 }], null];
    }

    // Auth: Login query
    if (cleanSql.startsWith('SELECT * FROM users WHERE email = ? AND password = ?')) {
      const email = params[0];
      const password = params[1];
      const found = this.users.find(u => u.email === email && u.password === password);
      return [found ? [found] : [], null];
    }

    // Products: Get all
    if (cleanSql.startsWith('SELECT * FROM products') && !cleanSql.includes('WHERE id = ?')) {
      return [this.products, null];
    }

    // Products: Get single (handles SELECT * or SELECT stock or SELECT 1 FROM products WHERE id = ?)
    if (cleanSql.includes('FROM products WHERE id = ?') || cleanSql.includes('FROM products WHERE id=?')) {
      const id = parseInt(params[0]);
      const product = this.products.find(p => p.id === id);
      return [product ? [product] : [], null];
    }

    // Products: Update stock
    if (cleanSql.startsWith('UPDATE products SET stock = ? WHERE id = ?')) {
      const stock = parseInt(params[0]);
      const id = parseInt(params[1]);
      const product = this.products.find(p => p.id === id);
      if (product) {
        product.stock = stock;
      }
      return [{ affectedRows: product ? 1 : 0 }, null];
    }

    // Products: Update price
    if (cleanSql.startsWith('UPDATE products SET price = ? WHERE id = ?')) {
      const price = parseFloat(params[0]);
      const id = parseInt(params[1]);
      const product = this.products.find(p => p.id === id);
      if (product) {
        product.price = price;
      }
      return [{ affectedRows: product ? 1 : 0 }, null];
    }

    // Products: Insert new
    if (cleanSql.startsWith('INSERT INTO products (name, description, price, stock, image_url)')) {
      const [name, description, price, stock, image_url] = params;
      const newProduct = {
        id: Math.max(0, ...this.products.map(p => p.id)) + 1,
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: image_url || null,
        created_at: new Date().toISOString()
      };
      this.products.push(newProduct);
      return [{ insertId: newProduct.id }, null];
    }

    // Products: Delete
    if (cleanSql.startsWith('DELETE FROM products WHERE id = ?')) {
      const id = parseInt(params[0]);
      const idx = this.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.products.splice(idx, 1);
        return [{ affectedRows: 1 }, null];
      }
      return [{ affectedRows: 0 }, null];
    }

    // Addresses: Get by user
    if (cleanSql.startsWith('SELECT id, user_id, street, city, state, zip FROM addresses WHERE user_id = ?')) {
      const userId = parseInt(params[0]);
      const userAddresses = this.addresses.filter(a => a.user_id === userId);
      return [userAddresses, null];
    }

    // Addresses: Insert new
    if (cleanSql.startsWith('INSERT INTO addresses (user_id, street, city, state, zip)')) {
      const [userId, street, city, state, zip] = params;
      const newAddr = {
        id: this.addresses.length + 1,
        user_id: parseInt(userId),
        street,
        city,
        state,
        zip
      };
      this.addresses.push(newAddr);
      return [{ insertId: newAddr.id }, null];
    }

    // Orders: Insert new order
    if (cleanSql.startsWith('INSERT INTO orders (user_id, total_amount, status)')) {
      const [userId, totalAmount, status] = params;
      const newOrder = {
        id: this.orders.length + 1,
        user_id: parseInt(userId),
        total_amount: parseFloat(totalAmount),
        status: status || 'Pending',
        created_at: new Date().toISOString()
      };
      this.orders.push(newOrder);
      return [{ insertId: newOrder.id }, null];
    }

    // Order Items: Insert
    if (cleanSql.startsWith('INSERT INTO order_items (order_id, product_id, quantity, price)')) {
      const [orderId, productId, quantity, price] = params;
      const newItem = {
        id: this.orderItems.length + 1,
        order_id: parseInt(orderId),
        product_id: parseInt(productId),
        quantity: parseInt(quantity),
        price: parseFloat(price)
      };
      this.orderItems.push(newItem);
      return [{ insertId: newItem.id }, null];
    }

    // Orders: Get all for admin
    if (cleanSql.startsWith('SELECT * FROM orders ORDER BY created_at DESC')) {
      return [this.orders, null];
    }

    // Orders: Get by user
    if (cleanSql.startsWith('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')) {
      const userId = parseInt(params[0]);
      const userOrders = this.orders.filter(o => o.user_id === userId);
      return [userOrders, null];
    }

    // Orders: Get single order by id
    if (cleanSql.startsWith('SELECT * FROM orders WHERE id = ?') || cleanSql.startsWith('SELECT * FROM orders WHERE id=?')) {
      const id = parseInt(params[0]);
      const order = this.orders.find(o => o.id === id);
      return [order ? [order] : [], null];
    }

    // Order Items: Get by order_id (plain items fetch)
    if (cleanSql.startsWith('SELECT product_id, quantity FROM order_items WHERE order_id = ?')) {
      const orderId = parseInt(params[0]);
      const items = this.orderItems.filter(oi => oi.order_id === orderId);
      return [items, null];
    }

    // Order Items: Get by order_id with join on products
    if (cleanSql.includes('FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?')) {
      const orderId = parseInt(params[0]);
      const items = this.orderItems
        .filter(oi => oi.order_id === orderId)
        .map(oi => {
          const product = this.products.find(p => p.id === oi.product_id);
          return {
            ...oi,
            name: product ? product.name : 'Unknown Product',
            image_url: product ? product.image_url : null
          };
        });
      return [items, null];
    }

    // Orders: Update status
    if (cleanSql.startsWith('UPDATE orders SET status = ? WHERE id = ?')) {
      const status = params[0];
      const id = parseInt(params[1]);
      const order = this.orders.find(o => o.id === id);
      if (order) {
        order.status = status;
      }
      return [{ affectedRows: order ? 1 : 0 }, null];
    }

    console.warn(`⚠️ Unhandled SQL query in simulator: ${cleanSql}`);
    return [[], null];
  }
}

let pool;
let isInMemory = false;

// Create database connection pool
try {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  // Attempt to create a standard MySQL connection pool
  // But wrap it in a lazy initialization check, or test the connection
  pool = mysql.createPool(dbConfig);
  
  // Test connection immediately
  pool.getConnection()
    .then(conn => {
      console.log('✅ Connected to MySQL database successfully!');
      conn.release();
    })
    .catch(err => {
      console.error('❌ Failed to connect to MySQL database:', err.message);
      isInMemory = true;
      pool = new InMemoryDatabase();
    });

} catch (err) {
  console.error('❌ Database Configuration Error:', err.message);
  isInMemory = true;
  pool = new InMemoryDatabase();
}

module.exports = {
  query: (sql, params) => pool.query(sql, params),
  isInMemory: () => isInMemory
};
