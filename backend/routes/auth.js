const express = require('express');
const router = express.Router();
const { 
    signup, 
    login, 
    getProfile,
    signupValidation,
    loginValidation 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
