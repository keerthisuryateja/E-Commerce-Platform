const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/addresses', auth, userController.getAddresses);
router.post('/addresses', auth, userController.addAddress);

module.exports = router;
