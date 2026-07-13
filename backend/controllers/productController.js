const db = require('../config/db');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    return res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Update product stock (Admin only)
exports.updateStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || stock === null || isNaN(stock) || stock < 0) {
    return res.status(400).json({ message: 'Valid stock quantity is required' });
  }

  try {
    const [result] = await db.query('UPDATE products SET stock = ? WHERE id = ?', [parseInt(stock), parseInt(id)]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Broadcast the update in real-time if global broadcast helper exists
    if (typeof global.broadcastInventoryUpdate === 'function') {
      global.broadcastInventoryUpdate(parseInt(id), parseInt(stock));
    }

    return res.json({
      message: 'Stock updated successfully',
      productId: parseInt(id),
      stock: parseInt(stock)
    });

  } catch (err) {
    console.error('Update stock error:', err);
    return res.status(500).json({ message: 'Failed to update product stock' });
  }
};

// Update product price (Admin only)
exports.updatePrice = async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  if (price === undefined || price === null || isNaN(price) || price < 0) {
    return res.status(400).json({ message: 'Valid price is required' });
  }

  try {
    const [result] = await db.query('UPDATE products SET price = ? WHERE id = ?', [parseFloat(price), parseInt(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      message: 'Price updated successfully',
      productId: parseInt(id),
      price: parseFloat(price)
    });

  } catch (err) {
    console.error('Update price error:', err);
    return res.status(500).json({ message: 'Failed to update product price' });
  }
};

// Create new product (Admin only)
exports.createProduct = async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Name, price, and stock are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', parseFloat(price), parseInt(stock), image_url || null]
    );

    return res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: result.insertId,
        name,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: image_url || null
      }
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ message: 'Failed to create product' });
  }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [parseInt(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deleted successfully', productId: parseInt(id) });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
};
