const express = require('express');
const router = express.Router();
const { 
    generateQR, 
    getTeacherClasses, 
    getClassAttendance, 
    getRealTimeAttendance,
    generateQRValidation 
} = require('../controllers/teacherController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication and teacher role
router.use(authenticateToken);
router.use(authorizeRole('teacher'));

// QR Code and Class Management
router.post('/generate-qr', generateQRValidation, generateQR);
router.get('/classes', getTeacherClasses);
router.get('/attendance/:classId', getClassAttendance);
router.get('/realtime-attendance', getRealTimeAttendance);

module.exports = router;
