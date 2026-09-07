const express = require('express');
const router = express.Router();
const {createProduct} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createProduct);

module.exports = router;