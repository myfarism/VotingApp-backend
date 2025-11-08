const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const Validator = require('../middleware/validator');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', Validator.validateRegistration, AuthController.registerUser);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/login', Validator.validateLogin, AuthController.loginUser);

// Protected routes
router.get('/profile', authenticate, AuthController.getUserProfile);
router.post('/change-password', authenticate, AuthController.changePassword);

module.exports = router;
