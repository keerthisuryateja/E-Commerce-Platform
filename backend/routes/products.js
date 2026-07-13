const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

router.get('/', productController.getAllProducts);
router.post('/', auth, adminOnly, productController.createProduct);
router.patch('/:id/stock', auth, adminOnly, productController.updateStock);
router.patch('/:id/price', auth, adminOnly, productController.updatePrice);
router.delete('/:id', auth, adminOnly, productController.deleteProduct);

module.exports = router;
