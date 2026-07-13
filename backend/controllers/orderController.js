const db = require('../config/db');

// Create a new order with automated payment validation
exports.createOrder = async (req, res) => {
  const { items, totalAmount } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty. Order cannot be created.' });
  }

  try {
    // 1. Verify stock availability for all items first
    for (const item of items) {
      const [products] = await db.query('SELECT * FROM products WHERE id = ?', [item.id]);
      if (!products || products.length === 0) {
        return res.status(404).json({ message: `Product "${item.name}" not found.` });
      }
      const product = products[0];
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${item.name}". Only ${product.stock} left.` });
      }
    }

    // 2. Insert into orders table
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'Pending'] // Starts as Pending processing
    );
    const orderId = orderResult.insertId;

    // 3. Insert items and decrement stock
    for (const item of items) {
      // Insert item
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );

      // Decrement stock
      const [products] = await db.query('SELECT stock FROM products WHERE id = ?', [item.id]);
      const currentStock = products[0].stock;
      const newStock = Math.max(0, currentStock - item.quantity);

      await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, item.id]);

      // Broadcast new stock in real-time
      if (typeof global.broadcastInventoryUpdate === 'function') {
        global.broadcastInventoryUpdate(item.id, newStock);
      }
    }

    // Broadcast order addition in real-time to Admin
    if (typeof global.broadcastOrderUpdate === 'function') {
      global.broadcastOrderUpdate();
    }

    return res.status(201).json({
      message: 'Order Placed Successfully',
      orderId
    });

  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Failed to place order' });
  }
};

// Get orders (Admins see all orders, Users see only their own)
exports.getOrders = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    let ordersQuery = 'SELECT * FROM orders ORDER BY created_at DESC';
    let queryParams = [];

    if (!isAdmin) {
      ordersQuery = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
      queryParams = [userId];
    }

    const [orders] = await db.query(ordersQuery, queryParams);

    // Fetch items for each order
    const enrichedOrders = [];
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [order.id]
      );
      enrichedOrders.push({
        ...order,
        items
      });
    }

    return res.json(enrichedOrders);

  } catch (err) {
    console.error('Fetch orders error:', err);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Cancel order (Admin can cancel, or user can cancel if status is not completed)
exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';

  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [parseInt(id)]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // If order is already cancelled, return error
    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Update order status to Cancelled
    await db.query('UPDATE orders SET status = ? WHERE id = ?', ['Cancelled', parseInt(id)]);

    // Restock the items
    const [items] = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [parseInt(id)]);
    
    for (const item of items) {
      const [products] = await db.query('SELECT stock FROM products WHERE id = ?', [item.product_id]);
      if (products && products.length > 0) {
        const newStock = parseInt(products[0].stock) + parseInt(item.quantity);
        await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, item.product_id]);

        // Broadcast restocked items in real-time
        if (typeof global.broadcastInventoryUpdate === 'function') {
          global.broadcastInventoryUpdate(item.product_id, newStock);
        }
      }
    }

    // Broadcast order updates to everyone
    if (typeof global.broadcastOrderUpdate === 'function') {
      global.broadcastOrderUpdate();
    }

    return res.json({ message: 'Order cancelled successfully. Items returned to inventory.' });

  } catch (err) {
    console.error('Cancel order error:', err);
    return res.status(500).json({ message: 'Failed to cancel order' });
  }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  const validStatuses = ['Pending', 'Packed', 'Picked Up', 'Delivered', 'Completed', 'Cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [parseInt(id)]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // If order is already cancelled, don't allow changing it
    if (order.status === 'Cancelled' && status !== 'Cancelled') {
      return res.status(400).json({ message: 'Cannot update status of a cancelled order.' });
    }

    // If changing to Cancelled, trigger restocking
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      const [items] = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [parseInt(id)]);
      
      for (const item of items) {
        const [products] = await db.query('SELECT stock FROM products WHERE id = ?', [item.product_id]);
        if (products && products.length > 0) {
          const newStock = parseInt(products[0].stock) + parseInt(item.quantity);
          await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, item.product_id]);

          // Broadcast restocked items in real-time
          if (typeof global.broadcastInventoryUpdate === 'function') {
            global.broadcastInventoryUpdate(item.product_id, newStock);
          }
        }
      }
    }

    // Update status
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, parseInt(id)]);

    // Broadcast order updates to everyone
    if (typeof global.broadcastOrderUpdate === 'function') {
      global.broadcastOrderUpdate();
    }

    return res.json({ message: `Order status updated to ${status} successfully.`, status });

  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
};
