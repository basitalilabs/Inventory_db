const express = require('express');
const {body} = require('express-validator');
const Validate = require('../middleware/validate');
const router = express.Router();
const {createProduct, getAllProducts, getProductById, updateProductById, deleteProduct} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

const productValidation = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('category_id').notEmpty().withMessage('Category ID is required')
];

router.post('/', authMiddleware, productValidation, Validate, createProduct);
router.get('/', getAllProducts)
router.get('/:id',getProductById);
router.patch('/:id', authMiddleware, productValidation, Validate, updateProductById)
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;