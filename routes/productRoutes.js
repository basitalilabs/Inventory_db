const express = require('express');
const router = express.Router();
const {createProduct, getAllProducts, getProductById, updateProductById, deleteProduct} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createProduct);
router.get('/', authMiddleware, getAllProducts)
router.get('/:id', getProductById);
router.patch('/:id',authMiddleware, updateProductById)
router.delete('/:id', authMiddleware, deleteProduct);
module.exports = router;