const QRCode = require('qrcode');
const { pool } = require('../config/db');
const { body, validationResult } = require('express-validator');

// Validation rules
const generateQRValidation = [
    body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
    body('date').isISO8601().withMessage('Please provide a valid date')
];

// Generate QR code for class
const generateQR = async (req, res) => {
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

        const { subject, date } = req.body;
        const teacherId = req.user.id;

        // Generate unique QR code string
        const qrString = `${subject}_${teacherId}_${Date.now()}`;
        
        // Set expiry time (30 seconds from now)
        const expiryTime = new Date(Date.now() + 30 * 1000);

        // Insert class record
        const [result] = await pool.execute(
            'INSERT INTO classes (teacher_id, subject, date, qr_code, qr_expiry_time) VALUES (?, ?, ?, ?, ?)',
            [teacherId, subject, date, qrString, expiryTime]
        );

        // Generate QR code image
        const qrCodeDataURL = await QRCode.toDataURL(qrString);

        res.json({
            success: true,
            message: 'QR code generated successfully',
            data: {
                classId: result.insertId,
                qrCode: qrCodeDataURL,
                qrString: qrString,
                expiryTime: expiryTime,
                subject: subject,
                date: date
            }
        });

    } catch (error) {
        console.error('Generate QR error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get classes for teacher
const getTeacherClasses = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const [classes] = await pool.execute(`
            SELECT 
                c.id,
                c.subject,
                c.date,
                c.qr_code,
                c.qr_expiry_time,
                c.created_at,
                COUNT(a.id) as attendance_count
            FROM classes c
            LEFT JOIN attendance a ON c.id = a.class_id
            WHERE c.teacher_id = ?
            GROUP BY c.id
            ORDER BY c.date DESC, c.created_at DESC
        `, [teacherId]);

        res.json({
            success: true,
            data: {
                classes: classes
            }
        });

    } catch (error) {
        console.error('Get teacher classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get attendance for specific class
const getClassAttendance = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacherId = req.user.id;

        // Verify that the class belongs to the teacher
        const [classCheck] = await pool.execute(
            'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
            [classId, teacherId]
        );

        if (classCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class not found or access denied'
            });
        }

        // Get attendance records for the class
        const [attendance] = await pool.execute(`
            SELECT 
                a.id,
                a.timestamp,
                u.id as student_id,
                u.name as student_name,
                u.email as student_email
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            WHERE a.class_id = ?
            ORDER BY a.timestamp ASC
        `, [classId]);

        // Get class details
        const [classDetails] = await pool.execute(`
            SELECT 
                c.id,
                c.subject,
                c.date,
                c.qr_code,
                c.qr_expiry_time,
                u.name as teacher_name
            FROM classes c
            JOIN users u ON c.teacher_id = u.id
            WHERE c.id = ?
        `, [classId]);

        res.json({
            success: true,
            data: {
                class: classDetails[0],
                attendance: attendance,
                totalPresent: attendance.length
            }
        });

    } catch (error) {
        console.error('Get class attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get real-time attendance (students currently present)
const getRealTimeAttendance = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Get active classes (QR not expired) for the teacher
        const [activeClasses] = await pool.execute(`
            SELECT 
                c.id,
                c.subject,
                c.date,
                c.qr_expiry_time,
                COUNT(a.id) as present_count
            FROM classes c
            LEFT JOIN attendance a ON c.id = a.class_id
            WHERE c.teacher_id = ? 
            AND c.qr_expiry_time > NOW()
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `, [teacherId]);

        // Get detailed attendance for the most recent active class
        let detailedAttendance = [];
        if (activeClasses.length > 0) {
            const [attendance] = await pool.execute(`
                SELECT 
                    a.timestamp,
                    u.id as student_id,
                    u.name as student_name,
                    u.email as student_email
                FROM attendance a
                JOIN users u ON a.student_id = u.id
                WHERE a.class_id = ?
                ORDER BY a.timestamp ASC
            `, [activeClasses[0].id]);

            detailedAttendance = attendance;
        }

        res.json({
            success: true,
            data: {
                activeClasses: activeClasses,
                currentAttendance: detailedAttendance,
                totalActiveClasses: activeClasses.length
            }
        });

    } catch (error) {
        console.error('Get real-time attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    generateQR,
    getTeacherClasses,
    getClassAttendance,
    getRealTimeAttendance,
    generateQRValidation
};
