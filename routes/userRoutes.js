const express = require('express');
const {body} = require('express-validator');
const authLimiter = require('../middleware/authLimiterMiddleware')
const validate = require('../middleware/validate');
const router = express.Router();
const {registerUser, loginUser} = require("../controllers/userController");

const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, registerValidation, validate, registerUser);
router.post('/login', authLimiter, loginValidation, validate, loginUser);

module.exports = router