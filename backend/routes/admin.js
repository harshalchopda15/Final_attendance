const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    getAttendanceReports,
    getDashboardStats,
    createUserValidation,
    updateUserValidation 
} = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUserValidation, createUser);
router.put('/users/:id', updateUserValidation, updateUser);
router.delete('/users/:id', deleteUser);

// Reports and Analytics
router.get('/reports', getAttendanceReports);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
