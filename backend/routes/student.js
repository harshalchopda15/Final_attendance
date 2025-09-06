const express = require('express');
const router = express.Router();
const { 
    markAttendance, 
    getStudentAttendance, 
    getRecentClasses,
    markAttendanceValidation 
} = require('../controllers/studentController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication and student role
router.use(authenticateToken);
router.use(authorizeRole('student'));

// Attendance Management
router.post('/mark-attendance', markAttendanceValidation, markAttendance);
router.get('/attendance', getStudentAttendance);
router.get('/recent-classes', getRecentClasses);

module.exports = router;
