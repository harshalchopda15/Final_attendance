const { pool } = require('../config/db');
const { body, validationResult } = require('express-validator');

// Validation rules
const markAttendanceValidation = [
    body('qrString').trim().isLength({ min: 1 }).withMessage('QR string is required')
];

// Mark attendance for student
const markAttendance = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { qrString } = req.body;
        const studentId = req.user.id;

        // Find active class with the QR string
        const [classes] = await pool.execute(`
            SELECT 
                c.id,
                c.subject,
                c.date,
                c.teacher_id,
                c.qr_expiry_time,
                u.name as teacher_name
            FROM classes c
            JOIN users u ON c.teacher_id = u.id
            WHERE c.qr_code = ? AND c.qr_expiry_time > NOW()
        `, [qrString]);

        if (classes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired QR code'
            });
        }

        const classData = classes[0];

        // Check if student has already marked attendance for this class
        const [existingAttendance] = await pool.execute(
            'SELECT id FROM attendance WHERE student_id = ? AND class_id = ?',
            [studentId, classData.id]
        );

        if (existingAttendance.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already marked for this class'
            });
        }

        // Mark attendance
        const [result] = await pool.execute(
            'INSERT INTO attendance (student_id, class_id) VALUES (?, ?)',
            [studentId, classData.id]
        );

        res.json({
            success: true,
            message: 'Attendance marked successfully',
            data: {
                attendanceId: result.insertId,
                class: {
                    id: classData.id,
                    subject: classData.subject,
                    date: classData.date,
                    teacher: classData.teacher_name
                },
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get student's attendance records
const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get all attendance records for the student
        const [attendance] = await pool.execute(`
            SELECT 
                a.id,
                a.timestamp,
                c.id as class_id,
                c.subject,
                c.date,
                u.name as teacher_name
            FROM attendance a
            JOIN classes c ON a.class_id = c.id
            JOIN users u ON c.teacher_id = u.id
            WHERE a.student_id = ?
            ORDER BY c.date DESC, a.timestamp DESC
        `, [studentId]);

        // Get attendance statistics
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT c.id) as total_classes,
                COUNT(a.id) as attended_classes,
                ROUND((COUNT(a.id) / COUNT(DISTINCT c.id)) * 100, 2) as attendance_percentage
            FROM classes c
            LEFT JOIN attendance a ON c.id = a.class_id AND a.student_id = ?
        `, [studentId]);

        // Get attendance by subject
        const [subjectStats] = await pool.execute(`
            SELECT 
                c.subject,
                COUNT(DISTINCT c.id) as total_classes,
                COUNT(a.id) as attended_classes,
                ROUND((COUNT(a.id) / COUNT(DISTINCT c.id)) * 100, 2) as attendance_percentage
            FROM classes c
            LEFT JOIN attendance a ON c.id = a.class_id AND a.student_id = ?
            GROUP BY c.subject
            ORDER BY c.subject
        `, [studentId]);

        res.json({
            success: true,
            data: {
                attendance: attendance,
                statistics: stats[0],
                subjectStatistics: subjectStats
            }
        });

    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get student's recent classes (for QR scanning context)
const getRecentClasses = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get recent classes that the student might want to attend
        const [classes] = await pool.execute(`
            SELECT 
                c.id,
                c.subject,
                c.date,
                c.qr_expiry_time,
                u.name as teacher_name,
                CASE 
                    WHEN a.id IS NOT NULL THEN 'attended'
                    WHEN c.qr_expiry_time > NOW() THEN 'active'
                    ELSE 'expired'
                END as status
            FROM classes c
            JOIN users u ON c.teacher_id = u.id
            LEFT JOIN attendance a ON c.id = a.class_id AND a.student_id = ?
            WHERE c.date >= CURDATE() - INTERVAL 7 DAY
            ORDER BY c.date DESC, c.created_at DESC
            LIMIT 10
        `, [studentId]);

        res.json({
            success: true,
            data: {
                classes: classes
            }
        });

    } catch (error) {
        console.error('Get recent classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    markAttendance,
    getStudentAttendance,
    getRecentClasses,
    markAttendanceValidation
};
