const express = require('express');
const router = express.Router();
const {createProduct, getAllProducts, getProductById} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createProduct);
router.get('/', authMiddleware, getAllProducts)
router.get('/:id', getProductById);
module.exports = router;