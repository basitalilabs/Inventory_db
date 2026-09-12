const express = require('express');
const {body} = require('express-validator');
const Validate = require('../middleware/validate');
const router = express.Router();
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

const categoryValidation = [
    body('name').notEmpty().withMessage('Category name is required'),
];

router.post('/', authMiddleware, categoryValidation, Validate, createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);    
router.patch('/:id', authMiddleware, categoryValidation, Validate, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory)

module.exports = router;